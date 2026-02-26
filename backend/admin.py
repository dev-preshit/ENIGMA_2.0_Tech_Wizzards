"""
DermAssist AI — Admin & Appointments Router
===========================================
Endpoints:
  Admin (role=admin required):
    GET  /admin/stats           — dashboard summary stats
    GET  /admin/users           — list all users (paginated)
    PUT  /admin/users/{id}/activate  — toggle user active status
    GET  /admin/scans           — list all scans
    GET  /admin/appointments    — list all appointments
    PUT  /admin/appointments/{id}/status  — accept/reject/complete an appointment
    POST /admin/appointments/{id}/notes   — add doctor notes to appointment

  Patient (any authenticated user):
    POST /appointments          — book a new appointment
    GET  /appointments          — get my appointments
    DELETE /appointments/{id}   — cancel my appointment
    GET  /doctors               — search nearby doctors (static curated list)
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from typing import Optional, List
from datetime import date as dt_date
import json

from database import SessionLocal
from models.user import User
from models.prediciton import Prediction
from models.appointment import Appointment
from auth import get_current_user

router = APIRouter(tags=["admin & appointments"])


# ── DB dependency ─────────────────────────────────────────────────────────────
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ── Admin guard ───────────────────────────────────────────────────────────────
def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


# ═══════════════════════════════════════════════════════════════════════════════
#  ADMIN ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════════════

@router.get("/admin/stats")
def admin_stats(
    _: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    total_users   = db.query(User).count()
    active_users  = db.query(User).filter(User.is_active == True).count()
    total_scans   = db.query(Prediction).count()
    total_apts    = db.query(Appointment).count()
    pending_apts  = db.query(Appointment).filter(Appointment.status == "pending").count()

    # High-risk scan count
    high_risk_scans = db.query(Prediction).filter(
        Prediction.predicted_label.in_(["mel", "bcc", "akiec"])
    ).count()

    # Recent 7 days scans
    from datetime import datetime, timedelta
    week_ago = datetime.utcnow() - timedelta(days=7)
    recent_scans = db.query(Prediction).filter(Prediction.created_at >= week_ago).count()

    return {
        "total_users":    total_users,
        "active_users":   active_users,
        "total_scans":    total_scans,
        "high_risk_scans": high_risk_scans,
        "recent_scans_7d": recent_scans,
        "total_appointments":   total_apts,
        "pending_appointments": pending_apts,
    }


@router.get("/admin/users")
def admin_list_users(
    skip: int = 0,
    limit: int = 50,
    search: Optional[str] = None,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    q = db.query(User)
    if search:
        q = q.filter(
            User.full_name.ilike(f"%{search}%") |
            User.email.ilike(f"%{search}%") |
            User.username.ilike(f"%{search}%")
        )
    users = q.order_by(User.created_at.desc()).offset(skip).limit(limit).all()
    total = q.count()

    result = []
    for u in users:
        scan_count = db.query(Prediction).filter(Prediction.user_id == u.id).count()
        result.append({
            "id":          u.id,
            "full_name":   u.full_name,
            "username":    u.username,
            "email":       u.email,
            "role":        u.role,
            "is_active":   u.is_active,
            "scan_count":  scan_count,
            "created_at":  str(u.created_at),
            "last_login":  str(u.last_login) if u.last_login else None,
        })
    return {"users": result, "total": total}


@router.put("/admin/users/{user_id}/activate")
def admin_toggle_user(
    user_id: int,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = not user.is_active
    db.commit()
    return {"id": user_id, "is_active": user.is_active, "message": f"User {'activated' if user.is_active else 'deactivated'}"}


@router.get("/admin/scans")
def admin_list_scans(
    skip: int = 0,
    limit: int = 50,
    risk: Optional[str] = None,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    q = db.query(Prediction, User).join(User, Prediction.user_id == User.id)

    # filter by risk via label
    if risk == "high":
        q = q.filter(Prediction.predicted_label.in_(["mel", "bcc", "akiec"]))
    elif risk == "moderate":
        q = q.filter(Prediction.predicted_label.in_(["bkl", "df", "vasc"]))
    elif risk == "low":
        q = q.filter(Prediction.predicted_label == "nv")

    total = q.count()
    rows  = q.order_by(Prediction.created_at.desc()).offset(skip).limit(limit).all()

    name_map = {
        'mel': 'Melanoma', 'bcc': 'Basal Cell Carcinoma',
        'akiec': 'Actinic Keratosis', 'bkl': 'Benign Keratosis',
        'df': 'Dermatofibroma', 'vasc': 'Vascular Lesion', 'nv': 'Melanocytic Nevi',
    }
    risk_map = {
        'mel': 'High Risk', 'bcc': 'High Risk', 'akiec': 'High Risk',
        'bkl': 'Moderate Risk', 'df': 'Moderate Risk', 'vasc': 'Moderate Risk',
        'nv': 'Low Risk',
    }

    result = []
    for scan, user in rows:
        extra = {}
        try:
            extra = json.loads(scan.extra_metadata) if scan.extra_metadata else {}
        except Exception:
            pass
        result.append({
            "id":             scan.id,
            "user_id":        scan.user_id,
            "user_name":      user.full_name,
            "user_email":     user.email,
            "predicted_label": scan.predicted_label,
            "diagnosis_name": name_map.get(scan.predicted_label, scan.predicted_label),
            "risk_level":     risk_map.get(scan.predicted_label, "Unknown"),
            "confidence_score": scan.confidence_score,
            "image_url":      extra.get("image_url"),
            "created_at":     str(scan.created_at),
        })
    return {"scans": result, "total": total}


@router.get("/admin/appointments")
def admin_list_appointments(
    skip: int = 0,
    limit: int = 50,
    status: Optional[str] = None,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    q = db.query(Appointment, User).join(User, Appointment.user_id == User.id)
    if status:
        q = q.filter(Appointment.status == status)
    total = q.count()
    rows  = q.order_by(Appointment.created_at.desc()).offset(skip).limit(limit).all()

    result = []
    for apt, user in rows:
        result.append({
            "id":              apt.id,
            "patient_name":    user.full_name,
            "patient_email":   user.email,
            "patient_phone":   user.phone_number,
            "doctor_name":     apt.doctor_name,
            "doctor_specialty": apt.doctor_specialty,
            "doctor_clinic":   apt.doctor_clinic,
            "appointment_date": str(apt.appointment_date),
            "appointment_time": apt.appointment_time,
            "reason":          apt.reason,
            "notes":           apt.notes,
            "status":          apt.status,
            "created_at":      str(apt.created_at),
        })
    return {"appointments": result, "total": total}


class AppointmentStatusUpdate(BaseModel):
    status: str   # accepted / rejected / completed

@router.put("/admin/appointments/{apt_id}/status")
def admin_update_appointment_status(
    apt_id: int,
    body: AppointmentStatusUpdate,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    valid = {"accepted", "rejected", "completed", "pending"}
    if body.status not in valid:
        raise HTTPException(status_code=400, detail=f"Status must be one of {valid}")
    apt = db.query(Appointment).filter(Appointment.id == apt_id).first()
    if not apt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    apt.status = body.status
    db.commit()
    return {"id": apt_id, "status": apt.status}


class DoctorNotes(BaseModel):
    notes: str

@router.post("/admin/appointments/{apt_id}/notes")
def admin_add_notes(
    apt_id: int,
    body: DoctorNotes,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    apt = db.query(Appointment).filter(Appointment.id == apt_id).first()
    if not apt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    apt.notes = body.notes
    db.commit()
    return {"id": apt_id, "notes": apt.notes}


# ═══════════════════════════════════════════════════════════════════════════════
#  PATIENT APPOINTMENT ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════════════

class BookAppointmentRequest(BaseModel):
    doctor_name:      str
    doctor_specialty: Optional[str] = "Dermatologist"
    doctor_clinic:    Optional[str] = None
    doctor_address:   Optional[str] = None
    doctor_phone:     Optional[str] = None
    appointment_date: str    # ISO: "2025-03-15"
    appointment_time: str    # "10:30 AM"
    reason:           Optional[str] = None


@router.post("/appointments")
def book_appointment(
    body: BookAppointmentRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user:
        raise HTTPException(status_code=401, detail="Login required to book appointments")

    try:
        apt_date = dt_date.fromisoformat(body.appointment_date)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")

    apt = Appointment(
        user_id          = current_user.id,
        doctor_name      = body.doctor_name,
        doctor_specialty = body.doctor_specialty,
        doctor_clinic    = body.doctor_clinic,
        doctor_address   = body.doctor_address,
        doctor_phone     = body.doctor_phone,
        appointment_date = apt_date,
        appointment_time = body.appointment_time,
        reason           = body.reason,
        status           = "pending",
    )
    db.add(apt)
    db.commit()
    db.refresh(apt)
    return {
        "id":     apt.id,
        "status": apt.status,
        "message": "Appointment booked successfully! Awaiting confirmation."
    }


@router.get("/appointments")
def my_appointments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    apts = (
        db.query(Appointment)
        .filter(Appointment.user_id == current_user.id)
        .order_by(Appointment.created_at.desc())
        .all()
    )

    return [
        {
            "id":              a.id,
            "doctor_name":     a.doctor_name,
            "doctor_specialty": a.doctor_specialty,
            "doctor_clinic":   a.doctor_clinic,
            "doctor_address":  a.doctor_address,
            "doctor_phone":    a.doctor_phone,
            "appointment_date": str(a.appointment_date),
            "appointment_time": a.appointment_time,
            "reason":          a.reason,
            "notes":           a.notes,
            "status":          a.status,
            "created_at":      str(a.created_at),
        }
        for a in apts
    ]


@router.delete("/appointments/{apt_id}")
def cancel_appointment(
    apt_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    apt = db.query(Appointment).filter(
        Appointment.id == apt_id,
        Appointment.user_id == current_user.id
    ).first()

    if not apt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    if apt.status in ("completed", "rejected"):
        raise HTTPException(status_code=400, detail="Cannot cancel a completed or rejected appointment")

    apt.status = "cancelled"
    db.commit()
    return {"message": "Appointment cancelled"}


# ═══════════════════════════════════════════════════════════════════════════════
#  DOCTORS DIRECTORY (curated + filterable)
# ═══════════════════════════════════════════════════════════════════════════════

DOCTORS_DB = [
    {
        "id": 1,
        "name": "Dr. Priya Sharma",
        "specialty": "Dermatologist",
        "qualification": "MD, MBBS – AIIMS Delhi",
        "clinic": "Skin Care Clinic",
        "address": "12, Connaught Place, New Delhi, Delhi 110001",
        "city": "Delhi",
        "phone": "+91 98100 11111",
        "email": "priya.sharma@skinclinic.in",
        "experience_years": 14,
        "rating": 4.8,
        "review_count": 312,
        "available_slots": ["10:00 AM", "11:00 AM", "2:00 PM", "3:30 PM"],
        "available_days": ["Mon", "Tue", "Wed", "Fri"],
        "consultation_fee": 700,
        "languages": ["Hindi", "English"],
        "image_placeholder": "PS",
        "specializes_in": ["Melanoma", "Acne", "Eczema", "Psoriasis"],
    },
    {
        "id": 2,
        "name": "Dr. Rahul Mehta",
        "specialty": "Dermatologist & Oncologist",
        "qualification": "MD Dermatology, DNB – Bombay Hospital",
        "clinic": "Advanced Skin Institute",
        "address": "45, Linking Road, Bandra West, Mumbai, Maharashtra 400050",
        "city": "Mumbai",
        "phone": "+91 98200 22222",
        "email": "rahul.mehta@asi.in",
        "experience_years": 18,
        "rating": 4.9,
        "review_count": 487,
        "available_slots": ["9:00 AM", "10:30 AM", "12:00 PM", "4:00 PM"],
        "available_days": ["Mon", "Wed", "Thu", "Sat"],
        "consultation_fee": 1200,
        "languages": ["Hindi", "English", "Marathi"],
        "image_placeholder": "RM",
        "specializes_in": ["Skin Cancer", "Basal Cell Carcinoma", "Moles", "Pigmentation"],
    },
    {
        "id": 3,
        "name": "Dr. Ananya Krishnan",
        "specialty": "Cosmetic Dermatologist",
        "qualification": "MD – Madras Medical College",
        "clinic": "DermaCare Centre",
        "address": "78, Anna Salai, Teynampet, Chennai, Tamil Nadu 600018",
        "city": "Chennai",
        "phone": "+91 94440 33333",
        "email": "ananya.k@dermacare.in",
        "experience_years": 10,
        "rating": 4.7,
        "review_count": 198,
        "available_slots": ["11:00 AM", "1:00 PM", "3:00 PM", "5:00 PM"],
        "available_days": ["Tue", "Wed", "Fri", "Sat"],
        "consultation_fee": 600,
        "languages": ["Tamil", "English", "Hindi"],
        "image_placeholder": "AK",
        "specializes_in": ["Keratosis", "Dermatofibroma", "Anti-aging", "Laser"],
    },
    {
        "id": 4,
        "name": "Dr. Sanjay Gupta",
        "specialty": "Dermatologist",
        "qualification": "MD, DVD – KEM Hospital Pune",
        "clinic": "Pune Skin Solutions",
        "address": "22, FC Road, Shivajinagar, Pune, Maharashtra 411005",
        "city": "Pune",
        "phone": "+91 98700 44444",
        "email": "sanjay.gupta@pss.in",
        "experience_years": 12,
        "rating": 4.6,
        "review_count": 245,
        "available_slots": ["9:30 AM", "11:00 AM", "2:30 PM", "4:30 PM"],
        "available_days": ["Mon", "Tue", "Thu", "Fri", "Sat"],
        "consultation_fee": 550,
        "languages": ["Hindi", "English", "Marathi"],
        "image_placeholder": "SG",
        "specializes_in": ["Vascular Lesions", "Nevi", "Skin Screening", "Acne"],
    },
    {
        "id": 5,
        "name": "Dr. Meera Nair",
        "specialty": "Dermatologist",
        "qualification": "MD – Amrita Institute Kochi",
        "clinic": "Glow Dermatology",
        "address": "36, MG Road, Ernakulam, Kochi, Kerala 682035",
        "city": "Kochi",
        "phone": "+91 94960 55555",
        "email": "meera.nair@glowderm.in",
        "experience_years": 9,
        "rating": 4.8,
        "review_count": 167,
        "available_slots": ["10:00 AM", "12:00 PM", "3:00 PM", "5:30 PM"],
        "available_days": ["Mon", "Wed", "Fri", "Sat"],
        "consultation_fee": 500,
        "languages": ["Malayalam", "English", "Hindi"],
        "image_placeholder": "MN",
        "specializes_in": ["Melanoma screening", "Benign Lesions", "Skin Allergies"],
    },
    {
        "id": 6,
        "name": "Dr. Arjun Patel",
        "specialty": "Surgical Dermatologist",
        "qualification": "MCh Dermato-Surgery – BJ Medical College",
        "clinic": "Ahmedabad Skin & Laser Centre",
        "address": "101, CG Road, Navrangpura, Ahmedabad, Gujarat 380009",
        "city": "Ahmedabad",
        "phone": "+91 98980 66666",
        "email": "arjun.patel@aslc.in",
        "experience_years": 15,
        "rating": 4.7,
        "review_count": 289,
        "available_slots": ["9:00 AM", "11:30 AM", "2:00 PM", "4:00 PM"],
        "available_days": ["Tue", "Wed", "Thu", "Sat"],
        "consultation_fee": 800,
        "languages": ["Gujarati", "Hindi", "English"],
        "image_placeholder": "AP",
        "specializes_in": ["Surgical Excision", "Skin Cancer Surgery", "Biopsies"],
    },
    {
        "id": 7,
        "name": "Dr. Sunita Reddy",
        "specialty": "Dermatologist",
        "qualification": "MD – Osmania Medical College",
        "clinic": "HiTech Skin Clinic",
        "address": "56, Banjara Hills Road, Hyderabad, Telangana 500034",
        "city": "Hyderabad",
        "phone": "+91 99000 77777",
        "email": "sunita.reddy@hitech.in",
        "experience_years": 11,
        "rating": 4.6,
        "review_count": 203,
        "available_slots": ["10:30 AM", "12:00 PM", "2:30 PM", "5:00 PM"],
        "available_days": ["Mon", "Tue", "Thu", "Fri"],
        "consultation_fee": 650,
        "languages": ["Telugu", "Hindi", "English"],
        "image_placeholder": "SR",
        "specializes_in": ["Pigmentation", "Actinic Keratosis", "Photo-aging", "Moles"],
    },
    {
        "id": 8,
        "name": "Dr. Vikram Singh",
        "specialty": "Dermatologist & Venereologist",
        "qualification": "MD DVL – PGI Chandigarh",
        "clinic": "Chandigarh Derm Clinic",
        "address": "Sector 17-C, Chandigarh, Punjab 160017",
        "city": "Chandigarh",
        "phone": "+91 98140 88888",
        "email": "vikram.singh@cdc.in",
        "experience_years": 16,
        "rating": 4.9,
        "review_count": 356,
        "available_slots": ["9:00 AM", "10:00 AM", "1:00 PM", "3:30 PM"],
        "available_days": ["Mon", "Wed", "Fri", "Sat"],
        "consultation_fee": 900,
        "languages": ["Hindi", "Punjabi", "English"],
        "image_placeholder": "VS",
        "specializes_in": ["Melanocytic Nevi", "Rare Skin Disorders", "STIs", "Psoriasis"],
    },
]


@router.get("/doctors")
def get_doctors(
    city:   Optional[str] = Query(None),
    search: Optional[str] = Query(None),
):
    doctors = DOCTORS_DB
    if city:
        doctors = [d for d in doctors if d["city"].lower() == city.lower()]
    if search:
        s = search.lower()
        doctors = [
            d for d in doctors
            if s in d["name"].lower()
            or s in d["specialty"].lower()
            or any(s in spec.lower() for spec in d["specializes_in"])
            or s in d["city"].lower()
        ]
    return {"doctors": doctors, "total": len(doctors)}


@router.get("/doctors/cities")
def get_cities():
    cities = sorted(set(d["city"] for d in DOCTORS_DB))
    return {"cities": cities}
