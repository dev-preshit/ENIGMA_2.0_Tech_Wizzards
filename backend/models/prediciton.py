# from sqlalchemy import Column, Integer, String, Float
# from . import Base, get_ist_time

# class Prediction(Base):
#     __tablename__ = "predictions"

#     id = Column(Integer, primary_key=True, index=True)
#     diagnosis = Column(String, nullable=False)
#     risk_level = Column(String, nullable=False)
#     confidence = Column(Float, nullable=False)
#     created_at = Column(String, default=lambda: str(get_ist_time()))
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from .base import Base, ist_now

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)

    # Model Output
    predicted_label = Column(String(120), nullable=False)
    confidence_score = Column(Float)
    model_version = Column(String(50))
    processing_time_ms = Column(Integer)

    # Advanced Storage
    raw_output = Column(Text)        # raw model response
    extra_metadata = Column(Text)    # JSON string if needed

    status = Column(String(20), default="completed")
    

    created_at = Column(DateTime, default=ist_now)

    # Foreign Keys
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    image_id = Column(Integer, ForeignKey("images.id"), nullable=False)

    # Relationships
    user = relationship("User", back_populates="predictions")
    image = relationship("Image", back_populates="predictions")

    def __repr__(self):
        return f"<Prediction {self.predicted_label} ({self.confidence_score})>"
