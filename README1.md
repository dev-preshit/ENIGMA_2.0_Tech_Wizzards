# 🩺 DermAssist AI — Skin Cancer Screening App

A full-stack AI-powered skin cancer screening web application. Upload a skin lesion image and get instant risk classification powered by a TFLite deep learning model trained on the ISIC dataset.

---

## 📁 Project Structure

```
DermAssist-AI/
├── backend/
│   ├── main.py                    # FastAPI server
│   ├── requirements.txt           # Python dependencies
│   └── skin_cancer_model.tflite   # ⚠️ YOU MUST ADD THIS (see below)
│
├── frontend/
│   ├── src/
│   │   ├── components/            # Reusable UI components
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── UploadCard.jsx
│   │   │   ├── ResultCard.jsx
│   │   │   ├── ProcessingLoader.jsx
│   │   │   ├── RecommendationPanel.jsx
│   │   │   └── ExplainableAI.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── HowItWorks.jsx
│   │   │   ├── About.jsx
│   │   │   └── Safety.jsx
│   │   ├── layout/
│   │   │   └── Layout.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
└── README.md                      # This file
```

---

## ⚠️ IMPORTANT — Add Your Model File

The trained model file is **not included** in this repo (too large for version control).

1. Locate your `skin_cancer_model.tflite` file (from the original training project)
2. Copy it into the `backend/` folder:

```
DermAssist-AI/
└── backend/
    ├── main.py
    ├── requirements.txt
    └── skin_cancer_model.tflite   ← place it here
```

If you don't have the model yet, see the Training section below.

---

## 🚀 How to Run

### Step 1 — Set Up the Backend

Open a terminal and navigate to the backend folder:

```bash
cd DermAssist-AI/backend
```

#### Create a Python virtual environment (recommended)

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS / Linux
python3 -m venv venv
source venv/bin/activate
```

#### Install Python dependencies

```bash
pip install -r requirements.txt
```

> 💡 `tensorflow-cpu` is used — it works on most machines without a GPU. Installation may take a few minutes.

#### Start the backend server

```bash
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

✅ Backend is running! You can test it at: http://127.0.0.1:8000/docs

---

### Step 2 — Set Up the Frontend

Open a **new terminal** (keep the backend running) and navigate to the frontend folder:

```bash
cd DermAssist-AI/frontend
```

#### Install Node.js dependencies

```bash
npm install
```

> Requires Node.js v18+ — download from https://nodejs.org if needed.

#### Start the frontend dev server

```bash
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

✅ Frontend is running! Open http://localhost:5173 in your browser.

---

## 🔗 How They Connect

```
Browser (React App)
  └── Upload image → POST http://127.0.0.1:8000/predict
                              ↓
                         FastAPI Backend
                              ↓
                      TFLite Model runs inference
                              ↓
                     Returns: { diagnosis, risk_level, confidence }
                              ↓
              React displays result card + recommendations
```

The frontend sends the image as `multipart/form-data` using Axios. The backend receives it, preprocesses it to 128×128 RGB, runs inference, and returns a JSON response.

**CORS is already enabled** in the backend — no extra config needed.

---

## 🧠 Model Details

| Property     | Value                          |
|--------------|-------------------------------|
| Format       | TensorFlow Lite (.tflite)     |
| Input size   | 128 × 128 × 3 (RGB)           |
| Normalization| [0, 1] float32                |
| Classes      | 7 (ISIC HAM10000 dataset)     |
| Output       | Softmax probabilities         |

### Classification Classes

| Code   | Name                              | Risk Level    |
|--------|-----------------------------------|---------------|
| `mel`  | Melanoma                          | 🔴 High Risk  |
| `bcc`  | Basal Cell Carcinoma              | 🔴 High Risk  |
| `akiec`| Actinic Keratosis                 | 🔴 High Risk  |
| `bkl`  | Benign Keratosis                  | 🟡 Moderate   |
| `df`   | Dermatofibroma                    | 🟡 Moderate   |
| `vasc` | Vascular Lesion                   | 🟡 Moderate   |
| `nv`   | Melanocytic Nevi (Mole)           | 🟢 Low Risk   |

---

## 🛠️ API Reference

### `POST /predict`

**Request:** `multipart/form-data`

| Field  | Type   | Description               |
|--------|--------|---------------------------|
| `file` | File   | JPEG or PNG skin image    |

**Response:** `application/json`

```json
{
  "diagnosis": "mel",
  "risk_level": "High Risk",
  "confidence": 0.9243
}
```

**Error responses:**

| Code | Reason                          |
|------|---------------------------------|
| 400  | File is not JPEG or PNG         |
| 500  | Model inference failed          |

---

## 📦 Tech Stack

### Backend
- **FastAPI** — Python REST API framework
- **TensorFlow (CPU)** — TFLite model inference
- **OpenCV** — Image preprocessing
- **Pillow** — Image format handling
- **Uvicorn** — ASGI server

### Frontend
- **React 18 + Vite** — Fast modern UI
- **Tailwind CSS** — Utility-first styling
- **Framer Motion** — Smooth animations
- **Axios** — HTTP client
- **React Router v6** — Client-side routing
- **Lucide React** — Icon library

---

## 🐛 Troubleshooting

### ❌ "Failed to analyze image. Please ensure the backend server is running."
→ Make sure the backend is running at `http://127.0.0.1:8000`  
→ Check that you ran `uvicorn main:app --reload`

### ❌ "Error loading model" in backend terminal
→ Make sure `skin_cancer_model.tflite` is inside the `backend/` folder  
→ Check the filename matches exactly (case-sensitive on Linux/macOS)

### ❌ `npm install` fails
→ Make sure Node.js v18 or above is installed: `node --version`

### ❌ `pip install` fails on TensorFlow
→ Try: `pip install tensorflow-cpu --upgrade`  
→ On older Python (3.8–3.11 supported)

### ❌ CORS error in browser console
→ This should not happen as CORS is pre-configured.  
→ If it does, ensure the backend is running on port **8000** (not any other port)

---

## 🔒 Medical Disclaimer

> This application is for **educational and screening purposes only**. It does **not** provide a medical diagnosis. Always consult a licensed dermatologist for any skin concerns. Do not make medical decisions based solely on this tool's output.

---

## 📝 License

This project is for educational/academic use. Not for clinical deployment without proper regulatory approval.
