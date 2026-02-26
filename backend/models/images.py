# from sqlalchemy import Column, Integer, String, ForeignKey
# from database import Base

# class Image(Base):
#     __tablename__ = "images"

#     id = Column(Integer, primary_key=True, index=True)
#     file_path = Column(String)
#     user_id = Column(Integer, ForeignKey("users.id"))
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from .base import Base, ist_now

class Image(Base):
    __tablename__ = "images"

    id = Column(Integer, primary_key=True, index=True)

    image_name = Column(String(150))
    image_path = Column(String(255), nullable=False)
    image_format = Column(String(20))
    image_size_kb = Column(Integer)

    uploaded_at = Column(DateTime, default=ist_now)

    # Foreign Key
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Relationship
    owner = relationship("User", back_populates="images")
    predictions = relationship("Prediction", back_populates="image", cascade="all, delete")

    def __repr__(self):
        return f"<Image {self.image_name}>"
