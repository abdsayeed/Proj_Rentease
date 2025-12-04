from flask_jwt_extended import JWTManager
from pymongo import MongoClient, errors
import os

# Global instances
jwt = JWTManager()
mongo_client = None
db = None


def init_extensions(app):
    """
    Initializes extensions for the Flask application.
    
    Configures JWT authentication and establishes MongoDB connection with
    comprehensive error handling. Creates required collections if they don't exist.
    
    Args:
        app: Flask application instance
        
    Returns:
        Database: MongoDB database instance
        
    Raises:
        ServerSelectionTimeoutError: If MongoDB connection fails
        Exception: For other initialization errors
    """
    global mongo_client, db
    
    # Configure JWT
    app.config["JWT_SECRET_KEY"] = os.environ.get(
        "JWT_SECRET_KEY", 
        "your-secret-key-change-in-production"
    )
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = 86400  # 24 hours
    jwt.init_app(app)
    
    # Initialize MongoDB connection with error handling
    try:
        # Establish connection with timeout
        mongo_client = MongoClient(
            "mongodb://127.0.0.1:27017/",
            serverSelectionTimeoutMS=5000
        )
        
        # Verify connectivity with ping command
        mongo_client.admin.command("ping")
        app.logger.info("✓ MongoDB connection verified")
        
        # Select database
        db = mongo_client["rentease"]
        
        # Create required collections if they don't exist
        existing_collections = db.list_collection_names()
        
        if "users" not in existing_collections:
            db.create_collection("users")
            app.logger.info("✓ Created 'users' collection")
        
        if "biz" not in existing_collections:
            db.create_collection("biz")
            app.logger.info("✓ Created 'biz' collection")
        
        if "blacklist" not in existing_collections:
            db.create_collection("blacklist")
            app.logger.info("✓ Created 'blacklist' collection")
        
        # Attach database to app for access in routes
        app.db = db
        
        app.logger.info(f"✓ MongoDB connected successfully to database: {db.name}")
        app.logger.info(f"✓ Available collections: {', '.join(db.list_collection_names())}")
        
        print(f"✓ MongoDB connected: {db.name}")
        print(f"✓ Collections: {db.list_collection_names()}")
        
        return db
        
    except errors.ServerSelectionTimeoutError as e:
        error_msg = f"MongoDB connection failed - Server selection timeout: {str(e)}"
        app.logger.error(f"✗ {error_msg}")
        print(f"✗ {error_msg}")
        print("  Ensure MongoDB is running on mongodb://127.0.0.1:27017/")
        raise
        
    except errors.ConnectionFailure as e:
        error_msg = f"MongoDB connection failed - Connection failure: {str(e)}"
        app.logger.error(f"✗ {error_msg}")
        print(f"✗ {error_msg}")
        raise
        
    except Exception as e:
        error_msg = f"Unexpected error during MongoDB initialization: {str(e)}"
        app.logger.error(f"✗ {error_msg}")
        print(f"✗ {error_msg}")
        raise