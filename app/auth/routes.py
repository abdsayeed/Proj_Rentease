from flask import Blueprint, request, jsonify, make_response
from flask_jwt_extended import create_access_token
import bcrypt
from datetime import timedelta, datetime
import app.extensions as ext

auth_app = Blueprint("auth", __name__)


def get_data():
    """
    Get request data from JSON or form.
    
    Returns:
        dict: Request data
    """
    return request.get_json() if request.is_json else request.form


@auth_app.route("/register", methods=["POST"])
def register_user():
    """
    Register a new user account.
    
    Request Body:
        email (str): User email address
        password (str): User password
        role (str, optional): User role (default: "user")
        
    Returns:
        201: User created successfully with user_id and role
        400: Missing required fields or invalid input
        409: User already exists
        500: Database error
    """
    # Check database connection
    if ext.db is None:
        return make_response(jsonify({"error": "Database not connected"}), 500)
    
    try:
        # Get and validate request data
        data = get_data()
        email = data.get("email", "").strip()
        password = data.get("password", "")
        role = data.get("role", "user")
        
        # Validate required fields
        if not email:
            return make_response(jsonify({"error": "Email is required"}), 400)
        
        if not password:
            return make_response(jsonify({"error": "Password is required"}), 400)
        
        # Validate role
        if role not in ["user", "agent", "admin"]:
            return make_response(jsonify({"error": "Invalid role. Must be 'user', 'agent', or 'admin'"}), 400)
        
        # Check if user already exists
        coll = ext.db["users"]
        existing_user = coll.find_one({"email": email})
        if existing_user:
            return make_response(jsonify({"error": "User already exists"}), 409)
        
        # Hash password (truncate to 72 bytes for bcrypt compatibility)
        pwd_bytes = password.encode('utf-8')[:72]
        hashed = bcrypt.hashpw(pwd_bytes, bcrypt.gensalt())
        
        # Create new user document
        new_user = {
            "email": email,
            "password_hash": hashed,
            "role": role,
            "createdAt": datetime.utcnow()
        }
        
        # Insert user into database
        result = coll.insert_one(new_user)
        
        return make_response(jsonify({
            "msg": "Account created",
            "user_id": str(result.inserted_id),
            "role": role
        }), 201)
        
    except Exception as e:
        # Handle unexpected errors
        return make_response(jsonify({"error": f"Registration failed: {str(e)}"}), 500)


@auth_app.route("/login", methods=["POST"])
def login_user():
    """
    Authenticate user and generate JWT token.
    
    Request Body:
        email (str): User email address
        password (str): User password
        
    Returns:
        200: Login successful with access_token and role
        400: Missing required fields
        401: Invalid credentials
        500: Database error
    """
    # Check database connection
    if ext.db is None:
        return make_response(jsonify({"error": "Database not connected"}), 500)
    
    try:
        # Get and validate request data
        data = get_data()
        email = data.get("email", "").strip()
        password = data.get("password", "")
        
        # Validate required fields
        if not email:
            return make_response(jsonify({"error": "Email is required"}), 400)
        
        if not password:
            return make_response(jsonify({"error": "Password is required"}), 400)
        
        # Find user by email
        coll = ext.db["users"]
        user = coll.find_one({"email": email})
        
        if not user:
            return make_response(jsonify({"error": "Invalid credentials"}), 401)
        
        # Verify password (truncate to 72 bytes for bcrypt compatibility)
        pwd_bytes = password.encode('utf-8')[:72]
        if not bcrypt.checkpw(pwd_bytes, user.get("password_hash")):
            return make_response(jsonify({"error": "Invalid credentials"}), 401)
        
        # Generate JWT token with identity, role, and user_id as strings
        token = create_access_token(
            identity=str(user["_id"]),
            expires_delta=timedelta(hours=24),
            additional_claims={
                "role": user.get("role", "user"),
                "user_id": str(user["_id"])
            }
        )
        
        return make_response(jsonify({
            "msg": "Login successful",
            "access_token": token,
            "role": user.get("role", "user")
        }), 200)
        
    except Exception as e:
        # Handle unexpected errors
        return make_response(jsonify({"error": f"Login failed: {str(e)}"}), 500)