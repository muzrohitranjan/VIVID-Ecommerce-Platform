import motor.motor_asyncio
from dotenv import load_dotenv
import os

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017/seller_module")
try:
    client = motor.motor_asyncio.AsyncIOMotorClient(MONGODB_URL)
    db = client.seller_module
    products_collection = db.products
    sellers_collection = db.sellers
except:
    print("MongoDB not available - using mock")
    products_collection = None
    sellers_collection = None

