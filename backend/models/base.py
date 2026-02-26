from datetime import datetime
import pytz
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

ist = pytz.timezone("Asia/Kolkata")

def ist_now():
    return datetime.now(ist).replace(tzinfo=None)  # SQLite-safe naive datetime
