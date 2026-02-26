<<<<<<< HEAD
# 🩺 DermAssist AI — Skin Cancer Screening App

An AI-powered web application that analyzes skin lesion images and gives you an instant risk assessment. Upload a photo from your phone or computer and the AI will tell you whether the lesion looks concerning — and what to do next.

> ⚠️ **This is a screening tool, not a medical diagnosis.** Always consult a dermatologist for any skin concerns.

---

## 📁 Full Project Structure

```
DermAssist-AI/
│
├── backend/                          ← Python API server
│   ├── main.py                       ← Main FastAPI app (routes, inference, DB saving)
│   ├── auth.py                       ← Login & register routes, JWT token logic
│   ├── database.py                   ← SQLite database connection setup
│   ├── requirements.txt              ← All Python packages needed
│   ├── best_skin_cancer_model.h5     ← ⚠️ AI model file (you must add this)
│   └── models/                       ← Database table definitions
│       ├── __init__.py               ← Imports all models together
│       ├── base.py                   ← Shared SQLAlchemy base + timestamp helper
│       ├── user.py                   ← User table (name, email, password, etc.)
│       ├── images.py                 ← Image table (stores info about uploaded images)
│       └── prediciton.py             ← Prediction table (stores AI scan results)
│
├── frontend/                         ← React web app
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── src/
│       ├── App.jsx                   ← Route definitions + auth protection
│       ├── main.jsx                  ← React entry point
│       ├── index.css
│       ├── context/
│       │   └── AuthContext.jsx       ← Global login state (token, user info)
│       ├── layout/
│       │   └── Layout.jsx            ← Navbar + Footer wrapper
│       ├── pages/
│       │   ├── Home.jsx              ← Main page (upload, scan, results)
│       │   ├── LoginPage.jsx         ← Login form
│       │   ├── RegisterPage.jsx      ← Registration form
│       │   ├── ProfilePage.jsx       ← User profile + scan history
│       │   ├── HowItWorks.jsx
│       │   ├── About.jsx
│       │   └── Safety.jsx
│       └── components/
│           ├── Navbar.jsx            ← Top navigation with user avatar + logout
│           ├── Footer.jsx
│           ├── UploadCard.jsx        ← Image upload + camera capture
│           ├── ResultCard.jsx        ← AI result with human-friendly message
│           ├── ExplainableAI.jsx     ← Why the AI made that decision
│           ├── RecommendationPanel.jsx
│           └── ProcessingLoader.jsx
│
└── README.md                         ← This file
```

---

## 🧠 How the AI Works (Plain English)

The AI model was trained on the **ISIC HAM10000 dataset** — a collection of 10,015 real dermoscopy images of skin lesions, each labeled by expert dermatologists.

### Training Steps (What We Did)

**1. Data Preparation**
- Loaded 10,015 labeled images across 7 skin lesion types
- Split them: 80% for training, 10% for validation, 10% for testing
- Since some lesion types had very few photos (e.g. Dermatofibroma had ~100, Melanocytic Nevi had ~6,700), we duplicated the rare ones multiple times to balance it out — this is called **oversampling**

**2. Image Preprocessing (Before Training)**
Each image goes through a cleaning pipeline before the AI sees it:
- **Hair removal (Dull-Razor)** — removes dark hair strands that confuse the AI, using a technique called "blackhat filtering + inpainting"
- **Resize to 224×224 pixels** — all images must be the same size
- **Normalize pixel values to 0–1** — converts colors from 0–255 range to 0–1 for stable math

**3. Model Architecture (MobileNetV2)**
We used **MobileNetV2** — a pre-trained image recognition model from Google — as the base. This is called **Transfer Learning**: instead of training from scratch, we start with a model that already knows how to recognize shapes, textures, and colors, and then fine-tune it for skin lesions.

On top of MobileNetV2, we added:
- A **GlobalAveragePooling** layer — compresses the image features into a single vector
- A **Dense(256)** layer with L2 regularization — learns skin-specific patterns
- A **Dropout(0.5)** layer — randomly turns off neurons during training to prevent overfitting
- A final **Dense(7, softmax)** layer — outputs a probability for each of the 7 lesion classes

**4. Training**
- Trained for up to 10 epochs with early stopping
- Used custom class weights (Melanoma gets weight 2.0 — we penalize the model more for missing it)
- Saved the best version based on lowest validation loss → `best_skin_cancer_model.h5`

**5. What Happens When You Upload an Image**
```
You upload a photo
      ↓
Backend resizes it to 224×224 and normalizes it
      ↓
Model outputs 7 probability scores (one per lesion type)
      ↓
The class with the highest score = the diagnosis
      ↓
Risk level is assigned (High / Moderate / Low)
      ↓
Result is shown + saved to your scan history
```

### The 7 Classes

| Code | Name | Risk |
|------|------|------|
| `mel` | Melanoma | 🔴 High Risk |
| `bcc` | Basal Cell Carcinoma | 🔴 High Risk |
| `akiec` | Actinic Keratosis | 🔴 High Risk |
| `bkl` | Benign Keratosis | 🟡 Moderate |
| `df` | Dermatofibroma | 🟡 Moderate |
| `vasc` | Vascular Lesion | 🟡 Moderate |
| `nv` | Melanocytic Nevi (mole) | 🟢 Low Risk |

---

## 🚀 How to Run the Project

### Prerequisites
- Python 3.10 or 3.11
- Node.js v18+
- The `best_skin_cancer_model.h5` file placed in the `backend/` folder

---

### Step 1 — Start the Backend

Open a terminal and run:

```bash
cd DermAssist-AI/backend

# Create a virtual environment
python -m venv venv

# Activate it
venv\Scripts\activate        # Windows
source venv/bin/activate     # Mac/Linux

# Install all dependencies
pip install -r requirements.txt

# Start the server
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

You should see:
```
✅ Model loaded successfully.
INFO:     Uvicorn running on http://127.0.0.1:8000
```

Test it at: **http://127.0.0.1:8000/docs**

---

### Step 2 — Start the Frontend

Open a **second terminal** (keep the backend running) and run:

```bash
cd DermAssist-AI/frontend

npm install       # first time only
npm run dev
```

You should see:
```
  ➜  Local:   http://localhost:3000/
```

Open **http://localhost:3000** in your browser.

---

## 🔑 Authentication Flow

```
New user opens the app
      ↓
Redirected to /register → fills form → account created
      ↓
JWT token saved in browser localStorage
      ↓
Every future visit → token verified automatically → logged in instantly
      ↓
Token expires after 24 hours → redirected to /register again
```

Passwords are hashed using **bcrypt** — never stored in plain text.

---

## 💾 Database Structure

The app uses **SQLite** (a simple file-based database — no server needed). The file `dermassist.db` is created automatically in the `backend/` folder on first run.

### Tables

**users** — stores account info
| Column | What it stores |
|--------|---------------|
| id | Unique user ID |
| full_name | User's full name |
| username | Unique @username |
| email | Email address |
| password_hash | Bcrypt-hashed password |
| gender, phone_number, date_of_birth | Profile info |
| created_at | When they registered |

**images** — stores info about each uploaded image
| Column | What it stores |
|--------|---------------|
| id | Unique image ID |
| image_name | Generated filename |
| image_size_kb | File size |
| user_id | Which user uploaded it |

**predictions** — stores every AI scan result
| Column | What it stores |
|--------|---------------|
| id | Unique scan ID |
| predicted_label | e.g. "mel" |
| confidence_score | e.g. 0.92 |
| risk_level | High / Moderate / Low |
| processing_time_ms | How fast the AI ran |
| user_id | Which user did the scan |
| created_at | When the scan happened |

---

## 🔗 API Endpoints

| Method | Endpoint | What it does |
|--------|----------|-------------|
| POST | `/auth/register` | Create a new account |
| POST | `/auth/login` | Login, get JWT token |
| GET | `/auth/me` | Check if token is valid |
| GET | `/user/me` | Get full profile info |
| GET | `/user/scans` | Get scan history |
| POST | `/predict` | Analyze a skin image |
| GET | `/health` | Check if server is running |

---

## 📦 Tech Stack

### Backend
| Package | What it does |
|---------|-------------|
| FastAPI | Web API framework |
| TensorFlow / Keras | Loads and runs the AI model |
| OpenCV | Image preprocessing |
| SQLAlchemy | Database ORM |
| SQLite | Lightweight database |
| python-jose | JWT token generation |
| passlib + bcrypt | Password hashing |
| pytz | IST timezone for timestamps |

### Frontend
| Package | What it does |
|---------|-------------|
| React 18 + Vite | Fast modern UI framework |
| Tailwind CSS | Styling |
| Framer Motion | Animations |
| Axios | API calls |
| React Router v6 | Page navigation |
| Lucide React | Icons |

---

## 🐛 Common Errors & Fixes

**"Registration failed. Please try again."**
→ Check the backend terminal for the actual error
→ Most likely: backend is not running, or bcrypt version issue
→ Fix bcrypt: `pip install bcrypt==4.0.1 --force-reinstall`

**"Inference failed: Input shape mismatch"**
→ The model expects 224×224 images
→ Check `preprocess_for_tflite()` in `main.py` — resize must be `(224, 224)`

**"ModuleNotFoundError: No module named 'sqlalchemy'"**
→ Your virtual environment is not activated
→ Run: `venv\Scripts\activate` then `pip install -r requirements.txt`

**"No module named 'models.predictions'"**
→ Filename is `prediciton.py` (typo, no 's')
→ In `models/__init__.py` make sure it says: `from .prediciton import Prediction`

**Frontend shows blank page or connection refused**
→ Make sure both servers are running simultaneously
→ Backend on port 8000, Frontend on port 3000

---

## 🔒 Medical Disclaimer

This application is for **educational and screening purposes only**. It does not provide a medical diagnosis. Always consult a licensed dermatologist for any skin concerns. Do not make medical decisions based solely on this tool's output.

---

## 👥 Team

Built for AI Hackathon — DermAssist AI Team
=======
# Enigma_2.0_Tech_Wizzards
>>>>>>> 464a5e6d0edacc0aabf1d4a2dc8fff1235f2a5be
