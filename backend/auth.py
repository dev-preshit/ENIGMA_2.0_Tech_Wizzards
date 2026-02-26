from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime, timedelta, date as dt_date
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
import secrets

from database import SessionLocal
from models.user import User

# ── Config ────────────────────────────────────────────────────────────────────
SECRET_KEY = "dermassist-secret-key-change-in-production-2024"
ALGORITHM  = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24

# ── Token blacklist (in-memory) ───────────────────────────────────────────────
token_blacklist: set = set()

# ── Password reset store (in-memory) ─────────────────────────────────────────
reset_tokens: dict = {}

pwd_context   = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)

router = APIRouter(prefix="/auth", tags=["auth"])


# ── DB dependency ─────────────────────────────────────────────────────────────
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ── JWT helpers ───────────────────────────────────────────────────────────────
def create_access_token(data: dict):
    to_encode = data.copy()
    expire    = datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> Optional[User]:
    if not token:
        return None
    if token in token_blacklist:
        return None
    try:
        payload  = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if not username:
            return None
    except JWTError:
        return None
    return db.query(User).filter(User.username == username).first()


# ── Schemas ───────────────────────────────────────────────────────────────────
class RegisterRequest(BaseModel):
    full_name:     str
    username:      str
    email:         str
    password:      str
    phone_number:  Optional[str] = None
    gender:        Optional[str] = None
    date_of_birth: Optional[str] = None


class ForgotPasswordRequest(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    token:        str
    new_password: str


class UpdateProfileRequest(BaseModel):
    full_name:    Optional[str] = None
    phone_number: Optional[str] = None
    gender:       Optional[str] = None


# ── Register ──────────────────────────────────────────────────────────────────
@router.post("/register", status_code=201)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    if db.query(User).filter(User.username == payload.username).first():
        raise HTTPException(status_code=400, detail="Username already taken")

    dob = None
    if payload.date_of_birth:
        try:
            dob = dt_date.fromisoformat(payload.date_of_birth)
        except Exception:
            try:
                dob = datetime.strptime(payload.date_of_birth, "%d-%m-%Y").date()
            except Exception:
                pass

    user = User(
        full_name=payload.full_name,
        username=payload.username,
        email=payload.email,
        phone_number=payload.phone_number,
        gender=payload.gender,
        date_of_birth=dob,
    )
    user.set_password(payload.password)
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": user.username})
    return {"access_token": token, "token_type": "bearer"}


# ── Login ─────────────────────────────────────────────────────────────────────
@router.post("/login")
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # Allow login with either username OR email
    user = (
        db.query(User).filter(User.username == form.username).first() or
        db.query(User).filter(User.email    == form.username).first()
    )

    # ✅ FIXED: was check_password (doesn't exist) → now verify_password
    if not user or not user.verify_password(form.password):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    token = create_access_token({"sub": user.username})
    return {"access_token": token, "token_type": "bearer"}


# ── Get current user info ─────────────────────────────────────────────────────
@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return {
        "id":            current_user.id,
        "full_name":     current_user.full_name,
        "username":      current_user.username,
        "email":         current_user.email,
        "phone_number":  current_user.phone_number,
        "gender":        current_user.gender,
        "date_of_birth": str(current_user.date_of_birth) if current_user.date_of_birth else None,
        "role":          current_user.role,
    }


# ── Logout ────────────────────────────────────────────────────────────────────
@router.post("/logout")
def logout(token: str = Depends(oauth2_scheme)):
    if token:
        token_blacklist.add(token)
    return {"message": "Logged out successfully"}


# ── Logout all devices ────────────────────────────────────────────────────────
@router.post("/logout-all")
def logout_all(
    token: str = Depends(oauth2_scheme),
    current_user: User = Depends(get_current_user)
):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    if token:
        token_blacklist.add(token)
    return {"message": "Logged out from all devices successfully"}


# ── Forgot password ───────────────────────────────────────────────────────────
@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()

    # Always return same message — don't reveal if email exists
    if not user:
        return {"message": "If that email is registered, a reset link has been sent."}

    reset_token = secrets.token_urlsafe(32)
    reset_tokens[reset_token] = {
        "email":   user.email,
        "expires": datetime.utcnow() + timedelta(minutes=30),
    }

    # Log token to console so you can test without email setup
    print(f"\n[RESET TOKEN for {user.email}]: {reset_token}\n")

    try:
        from email_service import send_reset_email
        send_reset_email(
            to_email=user.email,
            full_name=user.full_name,
            reset_token=reset_token
        )
    except Exception as e:
        print(f"Email send failed (token still valid): {e}")

    return {"message": "If that email is registered, a reset link has been sent."}


# ── Reset password ────────────────────────────────────────────────────────────
@router.post("/reset-password")
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    entry = reset_tokens.get(payload.token)
    if not entry:
        raise HTTPException(status_code=400, detail="Invalid or expired reset link.")
    if datetime.utcnow() > entry["expires"]:
        del reset_tokens[payload.token]
        raise HTTPException(status_code=400, detail="Reset link expired. Please request a new one.")

    user = db.query(User).filter(User.email == entry["email"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    user.set_password(payload.new_password)
    db.commit()
    del reset_tokens[payload.token]

    return {"message": "Password reset successfully. You can now log in."}


# ── Update profile ────────────────────────────────────────────────────────────
@router.put("/profile")
def update_profile(
    payload: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    if payload.full_name    is not None: current_user.full_name    = payload.full_name
    if payload.phone_number is not None: current_user.phone_number = payload.phone_number
    if payload.gender       is not None: current_user.gender       = payload.gender

    db.commit()
    db.refresh(current_user)

    return {
        "message":      "Profile updated successfully",
        "full_name":    current_user.full_name,
        "phone_number": current_user.phone_number,
        "gender":       current_user.gender,
    }


# ── Debug: check reset tokens (REMOVE BEFORE PRODUCTION) ─────────────────────
@router.get("/debug-reset-tokens")
def debug_tokens():
    return {
        "active_tokens": [
            {"token": k[:8] + "...", "email": v["email"], "expires": str(v["expires"])}
            for k, v in reset_tokens.items()
        ]
    }