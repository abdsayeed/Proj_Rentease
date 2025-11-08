from flask_jwt_extended import JWTManager
from pymongo import MongoClient,errors
import os

jwt = JWTManager()
mongo_client = None
db = None


def init_extensions(app):
    global mongo_client,db
    
    app.config["JWT_SECRET_KEY"] = os.environ.get("JWT_SECRET_KEY","your-secret-key-change-in-production")
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = 86400
    jwt.init_app(app)

    try:
        mongo_client = MongoClient("mongodb://127.0.0.1:27017/",serverSelectionTimeoutMS=5000)
        mongo_client.admin.command("ping")
        db = mongo_client["rentease"]
        
        if "biz" not in db.list_collection_names():
            db.create_collection("biz")
        if "blacklist" not in db.list_collection_names():
            db.create_collection("blacklist")
        if "users" not in db.list_collection_names():
            db.create_collection("users")
        
        app.db = db
        app.logger.info(" MongoDB connected")
        print(" DB connected:",db)
        print(" Collections:",db.list_collection_names())
        
        return db
    except errors.ServerSelectionTimeoutError as e:
        app.logger.error(f"MongoDB connection failed: {e}")
        print(" MongoDB failed:",str(e))
        raise
    except Exception as e:
        app.logger.error(f" Error: {e}")
        print(f" Error: {e}")
        raise