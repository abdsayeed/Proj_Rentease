from flask import Blueprint,request,jsonify,make_response
from flask_jwt_extended import create_access_token
import bcrypt
from datetime import timedelta
import app.extensions as ext

auth_app = Blueprint("auth",__name__)

# Get request data from JSON or form
def get_data():
    return request.get_json() if request.is_json else request.form

# Register new user
@auth_app.route("/register",methods=["POST"])
def register_user():
    if ext.db is None:
        return make_response(jsonify({"Error":"Database not connected"}),500)
    
    data = get_data()
    email = data.get("email")
    password = data.get("password")
    role = data.get("role","user")

    if not email or not password:
        return make_response(jsonify({"Error":"Email and password required"}),400)

    coll = ext.db["users"]
    if coll.find_one({"email":email}):
        return make_response(jsonify({"Error":"User already exists"}),409)

    pwd_bytes = password.encode('utf-8')[:72]
    hashed = bcrypt.hashpw(pwd_bytes,bcrypt.gensalt())
    
    new_user = {"email":email,"password_hash":hashed,"role":role}
    res = coll.insert_one(new_user)
    return make_response(jsonify({"msg":"Account created","user_id":str(res.inserted_id),"role":role}),201)

# User login
@auth_app.route("/login",methods=["POST"])
def login_user():
    if ext.db is None:
        return make_response(jsonify({"Error":"Database not connected"}),500)
    
    data = get_data()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return make_response(jsonify({"Error":"Email and password required"}),400)

    coll = ext.db["users"]
    user = coll.find_one({"email":email})
    if not user:
        return make_response(jsonify({"Error":"Invalid credentials"}),401)

    pwd_bytes = password.encode('utf-8')[:72]
    if not bcrypt.checkpw(pwd_bytes,user.get("password_hash")):
        return make_response(jsonify({"Error":"Invalid credentials"}),401)

    token = create_access_token(
        identity=str(user["_id"]),
        expires_delta=timedelta(hours=24),
        additional_claims={"role":user.get("role","user"),"user_id":str(user["_id"])}
    )
    return make_response(jsonify({"msg":"Login ok","access_token":token,"role":user.get("role","user")}),200)