# from sqlalchemy import Column, Integer, String
# from database import Base

# class User(Base):
#     __tablename__ = "users"

#     id = Column(Integer, primary_key=True, index=True)
#     name = Column(String)
#     email = Column(String)
from sqlalchemy import Column, Integer, String, Boolean, Date, DateTime, Text
from sqlalchemy.orm import relationship
from passlib.context import CryptContext
from .base import Base, ist_now

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    # Basic Identity
    full_name = Column(String(150), nullable=False)
    username = Column(String(80), unique=True, nullable=False, index=True)
    email = Column(String(150), unique=True, nullable=False, index=True)
    phone_number = Column(String(15))
    gender = Column(String(20))

    # Auth
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default="user")  # user/admin
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)

    # Profile
    bio = Column(Text)
    profile_picture = Column(String(255))
    date_of_birth = Column(Date)

    # Security tracking
    last_login = Column(DateTime, default=ist_now, onupdate=ist_now)

    # Timestamps
    created_at = Column(DateTime, default=ist_now)

    # Relationships
    images = relationship("Image", back_populates="owner", cascade="all, delete")
    predictions = relationship("Prediction", back_populates="user", cascade="all, delete")

    # 🔐 Password methods
    def set_password(self, password: str):
        self.password_hash = pwd_context.hash(password)

    def verify_password(self, password: str) -> bool:
        return pwd_context.verify(password, self.password_hash)

    def __repr__(self):
        return f"<User {self.username}>"