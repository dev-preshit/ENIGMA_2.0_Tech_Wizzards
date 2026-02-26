from sqlalchemy import Column, Integer, String, Boolean, Date, DateTime, Text
from sqlalchemy.orm import relationship
from passlib.context import CryptContext
from .base import Base, ist_now

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    full_name     = Column(String(150), nullable=False)
    username      = Column(String(80), unique=True, nullable=False, index=True)
    email         = Column(String(150), unique=True, nullable=False, index=True)
    phone_number  = Column(String(15))
    gender        = Column(String(20))

    password_hash = Column(String(255), nullable=False)
    role          = Column(String(20), default="user")
    is_active     = Column(Boolean, default=True)
    is_verified   = Column(Boolean, default=False)

    bio             = Column(Text)
    profile_picture = Column(String(255))
    date_of_birth   = Column(Date)

    last_login  = Column(DateTime, default=ist_now, onupdate=ist_now)
    created_at  = Column(DateTime, default=ist_now)

    images       = relationship("Image",       back_populates="owner", cascade="all, delete")
    predictions  = relationship("Prediction",  back_populates="user",  cascade="all, delete")
    appointments = relationship("Appointment", back_populates="user",  cascade="all, delete")

    def set_password(self, password: str):
        self.password_hash = pwd_context.hash(password)

    def verify_password(self, password: str) -> bool:
        return pwd_context.verify(password, self.password_hash)

    def __repr__(self):
        return f"<User {self.username}>"