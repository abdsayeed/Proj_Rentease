# Extensions setup - JWT auth, CORS, and MongoDB connection
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from pymongo import MongoClient, errors
import os

jwt = JWTManager()
mongo_client = None
db = None

def init_extensions(app):
    global mongo_client, db
    
    # allow requests from Angular frontend
    CORS(app, origins=["http://localhost:4200", "http://127.0.0.1:4200"], 
         supports_credentials=True,
         allow_headers=["Content-Type", "Authorization"],
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
    
    # JWT config
    app.config["JWT_SECRET_KEY"] = os.environ.get("JWT_SECRET_KEY", "your-secret-key-change-in-production")
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = 86400  # 24 hours
    jwt.init_app(app)

    # connect to MongoDB
    try:
        mongo_client = MongoClient("mongodb://127.0.0.1:27017/", serverSelectionTimeoutMS=5000)
        mongo_client.admin.command("ping")
        db = mongo_client["rentease"]
        
        # create collections if they don't exist
        if "biz" not in db.list_collection_names():
            db.create_collection("biz")
        if "blacklist" not in db.list_collection_names():
            db.create_collection("blacklist")
        if "users" not in db.list_collection_names():
            db.create_collection("users")
        
        app.db = db
        print("MongoDB connected:", db)
        print("Collections:", db.list_collection_names())
        
        return db
    except errors.ServerSelectionTimeoutError as e:
        print("MongoDB connection failed:", str(e))
        raise
    except Exception as e:
        print("Error:", e)
        raise
