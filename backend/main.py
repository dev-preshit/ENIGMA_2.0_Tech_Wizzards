from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import StreamingResponse
import tensorflow as tf
import numpy as np
import cv2
import os
import time
import uuid
import json
from typing import Optional
from sqlalchemy.orm import Session

from database import engine, SessionLocal
from models import Base          # ✅ FIXED: import Base from models.base
from models.user import User
from models.images import Image
from models.prediciton import Prediction
import auth
from auth import get_current_user

app = FastAPI(title="DermAssist AI Backend", version="2.0.0")

# ── Create all tables on startup ──────────────────────────────────────────────
Base.metadata.create_all(bind=engine)

# ── Static file serving ───────────────────────────────────────────────────────
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Auth router ───────────────────────────────────────────────────────────────
app.include_router(auth.router)

# ── TFLite model loading ──────────────────────────────────────────────────────
# ✅ FIXED: replaced tf.keras.models.load_model (wrong for .tflite)
#           with tf.lite.Interpreter (correct for .tflite files)
MODEL_PATH  = "skin_cancer_model.tflite"
interpreter = None

if not os.path.exists(MODEL_PATH):
    print(f"WARNING: Model file '{MODEL_PATH}' not found.")
else:
    try:
        interpreter = tf.lite.Interpreter(model_path=MODEL_PATH)
        interpreter.allocate_tensors()
        print("✅ TFLite model loaded successfully.")
    except Exception as e:
        print(f"❌ Error loading TFLite model: {e}")


# ── DB dependency ─────────────────────────────────────────────────────────────
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ── Image preprocessing ───────────────────────────────────────────────────────
def preprocess_image(image_data: bytes) -> np.ndarray:
    nparr = np.frombuffer(image_data, np.uint8)
    img   = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Could not decode image. Please upload a valid JPEG or PNG.")
    img      = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img      = cv2.resize(img, (128, 128))          # TFLite model expects 128×128
    img_arr  = img.astype('float32') / 255.0
    return np.expand_dims(img_arr, axis=0)


# ── Root & health endpoints ───────────────────────────────────────────────────
@app.get("/")
def root():
    return {
        "message":      "DermAssist AI Backend is running.",
        "model_loaded": interpreter is not None,
    }


@app.get("/health")
def health_check():
    return {"status": "ok", "model_loaded": interpreter is not None}


# ── Predict endpoint ──────────────────────────────────────────────────────────
@app.post("/predict")
async def predict(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    # ✅ FIXED: check interpreter instead of model
    if interpreter is None:
        raise HTTPException(status_code=503, detail="Model not loaded. Please check server logs.")
    if file.content_type not in ["image/jpeg", "image/png"]:
        raise HTTPException(status_code=400, detail="Only JPEG and PNG images are accepted.")

    contents = await file.read()

    try:
        input_data = preprocess_image(contents)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # ✅ FIXED: TFLite inference (was model.predict which only works for Keras)
    start_time = time.time()
    try:
        input_details  = interpreter.get_input_details()
        output_details = interpreter.get_output_details()
        interpreter.set_tensor(input_details[0]['index'], input_data.astype(np.float32))
        interpreter.invoke()
        output_data = interpreter.get_tensor(output_details[0]['index'])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference failed: {str(e)}")

    processing_ms = int((time.time() - start_time) * 1000)

    classes    = ['akiec', 'bcc', 'bkl', 'df', 'mel', 'nv', 'vasc']
    idx        = int(np.argmax(output_data))
    prediction = classes[idx]
    confidence = float(output_data[0][idx])

    risk_map = {
        'mel': 'High Risk',      'bcc': 'High Risk',      'akiec': 'High Risk',
        'bkl': 'Moderate Risk',  'df':  'Moderate Risk',  'vasc':  'Moderate Risk',
        'nv':  'Low Risk',
    }
    name_map = {
        'mel':   'Melanoma',
        'bcc':   'Basal Cell Carcinoma',
        'akiec': 'Actinic Keratosis',
        'bkl':   'Benign Keratosis',
        'df':    'Dermatofibroma',
        'vasc':  'Vascular Lesion',
        'nv':    'Melanocytic Nevi',
    }

    # ── Save scan if user is logged in ────────────────────────────────────────
    image_url = None
    if current_user:
        try:
            ext = (
                file.filename.split('.')[-1]
                if file.filename and '.' in file.filename
                else 'jpg'
            ).lower()
            image_name = f"{uuid.uuid4().hex}.{ext}"
            image_path = os.path.join(UPLOAD_DIR, image_name)

            with open(image_path, "wb") as f:
                f.write(contents)

            image_url = f"/uploads/{image_name}"

            image_record = Image(
                image_name=image_name,
                image_path=image_path,
                image_format=file.content_type,
                image_size_kb=len(contents) // 1024,
                user_id=current_user.id,
            )
            db.add(image_record)
            db.flush()

            scan_record = Prediction(
                predicted_label=prediction,
                confidence_score=round(confidence, 4),
                model_version="v2.0",
                processing_time_ms=processing_ms,
                raw_output=json.dumps({
                    classes[i]: round(float(output_data[0][i]), 4)
                    for i in range(len(classes))
                }),
                extra_metadata=json.dumps({
                    "risk_level":     risk_map[prediction],
                    "diagnosis_name": name_map[prediction],
                    "image_url":      image_url,
                }),
                status="completed",
                user_id=current_user.id,
                image_id=image_record.id,
            )
            db.add(scan_record)
            db.commit()
        except Exception as e:
            db.rollback()
            print(f"⚠ Could not save scan to DB: {e}")

    return {
        "diagnosis":      prediction,
        "diagnosis_name": name_map[prediction],
        "risk_level":     risk_map[prediction],
        "confidence":     round(confidence, 4),
        "all_scores":     {
            classes[i]: round(float(output_data[0][i]), 4)
            for i in range(len(classes))
        },
        "image_url": image_url,
    }


# ── User scan history ─────────────────────────────────────────────────────────
@app.get("/user/scans")
def get_user_scans(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    scans = (
        db.query(Prediction)
        .filter(Prediction.user_id == current_user.id)
        .order_by(Prediction.created_at.desc())
        .all()
    )

    result = []
    for scan in scans:
        extra = {}
        try:
            extra = json.loads(scan.extra_metadata) if scan.extra_metadata else {}
        except Exception:
            pass
        result.append({
            "id":                 scan.id,
            "predicted_label":    scan.predicted_label,
            "confidence_score":   scan.confidence_score,
            "risk_level":         extra.get("risk_level", ""),
            "diagnosis_name":     extra.get("diagnosis_name", scan.predicted_label),
            "image_url":          extra.get("image_url", None),
            "processing_time_ms": scan.processing_time_ms,
            "created_at":         str(scan.created_at),
        })
    return result


# ── Full user profile ─────────────────────────────────────────────────────────
@app.get("/user/me")
def get_full_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    total_scans = (
        db.query(Prediction)
        .filter(Prediction.user_id == current_user.id)
        .count()
    )

    return {
        "id":            current_user.id,
        "full_name":     current_user.full_name,
        "username":      current_user.username,
        "email":         current_user.email,
        "phone_number":  current_user.phone_number,
        "gender":        current_user.gender,
        "date_of_birth": str(current_user.date_of_birth) if current_user.date_of_birth else None,
        "role":          current_user.role,
        "is_active":     current_user.is_active,
        "total_scans":   total_scans,
        "created_at":    str(current_user.created_at),
    }

# ── Download PDF report for a single scan ─────────────────────────────────────
@app.get("/user/scans/{scan_id}/report")
def download_scan_report(
    scan_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from report_generator import generate_scan_report
    from io import BytesIO

    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    scan = db.query(Prediction).filter(
        Prediction.id == scan_id,
        Prediction.user_id == current_user.id
    ).first()

    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")

    extra = {}
    try:
        extra = json.loads(scan.extra_metadata) if scan.extra_metadata else {}
    except Exception:
        pass

    scan_data = {
        "id":               scan.id,
        "predicted_label":  scan.predicted_label,
        "confidence_score": scan.confidence_score,
        "risk_level":       extra.get("risk_level", "Low Risk"),
        "diagnosis_name":   extra.get("diagnosis_name", scan.predicted_label),
        "created_at":       str(scan.created_at),
        "raw_output":       scan.raw_output or "{}",
    }

    user_data = {
        "full_name":    current_user.full_name,
        "email":        current_user.email,
        "date_of_birth": str(current_user.date_of_birth) if current_user.date_of_birth else "N/A",
        "gender":       current_user.gender or "N/A",
        "phone_number": current_user.phone_number or "N/A",
    }

    try:
        pdf_bytes = generate_scan_report(scan_data, user_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Report generation failed: {str(e)}")

    filename = f"DermAssist_Report_{current_user.username}_Scan{scan_id}.pdf"
    return StreamingResponse(
        BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )