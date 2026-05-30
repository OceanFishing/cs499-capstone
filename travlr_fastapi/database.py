from pymongo import AsyncMongoClient
from dotenv import load_dotenv
import os

load_dotenv()

# Native async client from pymongo 4.9+. All operations require await
client = AsyncMongoClient(os.getenv("MONGO_URI"))
db = client["travlr"]