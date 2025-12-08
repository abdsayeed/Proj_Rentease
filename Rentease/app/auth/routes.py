# Auth routes - handles user registration and login
from flask import Blueprint, request, jsonify, make_response
from flask_jwt_extended import create_access_token
import bcrypt
from datetime import timedelta
import uuid
import app.extensions as ext

auth_app = Blueprint("auth", __name__)

# helper to get request data
def get_data():
    return request.get_json() if request.is_json else request.form

# helper to create api response
def api_response(success, message, data=None, status_code=200):
    response = {"success": success, "message": message}
    if data is not None:
        response["data"] = data
    return make_response(jsonify(response), status_code)


# POST /register - create new user account
@auth_app.route("/register", methods=["POST"])
def register_user():
    if ext.db is None:
        return api_response(False, "Database not connected", status_code=500)
    
    data = get_data()
    email = data.get("email")
    password = data.get("password")
    first_name = data.get("first_name", "")
    last_name = data.get("last_name", "")
    role = data.get("role", "customer")
    phone = data.get("phone", "")

    if not email or not password:
        return api_response(False, "Email and password required", status_code=400)

    coll = ext.db["users"]
    
    # check if user already exists
    if coll.find_one({"email": email}):
        return api_response(False, "User already exists", status_code=409)

    # hash password
    pwd_bytes = password.encode('utf-8')[:72]
    hashed = bcrypt.hashpw(pwd_bytes, bcrypt.gensalt())
    
    # create user document
    new_user = {
        "email": email,
        "password_hash": hashed,
        "first_name": first_name,
        "last_name": last_name,
        "role": role,
        "phone": phone
    }
    res = coll.insert_one(new_user)
    user_id = str(res.inserted_id)
    
    # generate tokens
    access_token = create_access_token(
        identity=user_id,
        expires_delta=timedelta(hours=24),
        additional_claims={"role": role, "user_id": user_id}
    )
    refresh_token = str(uuid.uuid4())
    
    user_data = {
        "_id": user_id,
        "email": email,
        "first_name": first_name,
        "last_name": last_name,
        "role": role,
        "phone": phone
    }
    
    return api_response(True, "Account created successfully", {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user": user_data
    }, status_code=201)


# POST /login - authenticate user
@auth_app.route("/login", methods=["POST"])
def login_user():
    if ext.db is None:
        return api_response(False, "Database not connected", status_code=500)
    
    data = get_data()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return api_response(False, "Email and password required", status_code=400)

    coll = ext.db["users"]
    user = coll.find_one({"email": email})
    
    if not user:
        return api_response(False, "Invalid credentials", status_code=401)

    # verify password
    pwd_bytes = password.encode('utf-8')[:72]
    if not bcrypt.checkpw(pwd_bytes, user.get("password_hash")):
        return api_response(False, "Invalid credentials", status_code=401)

    user_id = str(user["_id"])
    role = user.get("role", "customer")
    
    # generate tokens
    access_token = create_access_token(
        identity=user_id,
        expires_delta=timedelta(hours=24),
        additional_claims={"role": role, "user_id": user_id}
    )
    refresh_token = str(uuid.uuid4())
    
    user_data = {
        "_id": user_id,
        "email": user.get("email"),
        "first_name": user.get("first_name", ""),
        "last_name": user.get("last_name", ""),
        "role": role,
        "phone": user.get("phone", "")
    }
    
    return api_response(True, "Login successful", {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user": user_data
    })
