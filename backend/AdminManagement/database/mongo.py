from pymongo import MongoClient
import gridfs

MONGO_URI = "mongodb://mongodb:27017"
DB_NAME = "notes_db"

client = MongoClient(MONGO_URI)
db = client[DB_NAME]
fs = gridfs.GridFS(db)
