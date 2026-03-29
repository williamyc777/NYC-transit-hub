import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    DEBUG = os.getenv("FLASK_DEBUG", "True") == "True"
    PORT = int(os.getenv("PORT", 5000))
    MTA_SUBWAY_ALERTS_URL = os.getenv("MTA_SUBWAY_ALERTS_URL")
    MTA_BUS_ALERTS_URL = os.getenv("MTA_BUS_ALERTS_URL")