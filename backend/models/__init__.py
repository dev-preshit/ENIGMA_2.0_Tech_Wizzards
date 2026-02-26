from datetime import datetime
import pytz
from database import Base

ist = pytz.timezone("Asia/Kolkata")

def ist_now():
    return datetime.now(ist).isoformat()

from models.base import Base
from models.user import User
from models.images import Image
from models.prediciton import Prediction

__all__ = ["Base", "User", "Image", "Prediction"]