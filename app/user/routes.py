from flask import Blueprint,request,jsonify,make_response
from flask_jwt_extended import jwt_required,get_jwt
import app.extensions as ext

user_app = Blueprint("user",__name__)

# Get request data from JSON or form
def get_data():
    return request.get_json() if request.is_json else request.form

# Get current user's ID from JWT
def _uid():
    return get_jwt().get("user_id")

# Add property to favorites
@user_app.route("/favorites",methods=["POST"])
@jwt_required()
def add_favorite():
    if ext.db is None:
        return make_response(jsonify({"Error":"Database not connected"}),500)
    
    data = get_data()
    pid = data.get("property_id")
    if not pid:
        return make_response(jsonify({"Error":"property_id required"}),400)

    coll = ext.db["biz"]
    existing = coll.find_one({"type":"favorite","user_id":_uid(),"property_id":pid})
    if existing:
        return make_response(jsonify({"msg":"Already in favorites"}),200)
    
    fav = {"type":"favorite","user_id":_uid(),"property_id":pid}
    coll.insert_one(fav)
    return make_response(jsonify({"msg":"Added to favorites"}),201)


# Get user's favorites
@user_app.route("/favorites",methods=["GET"])
@jwt_required()
def list_favorites():
    if ext.db is None:
        return make_response(jsonify({"Error":"Database not connected"}),500)
    
    coll = ext.db["biz"]
    docs = list(coll.find({"type":"favorite","user_id":_uid()}))
    for d in docs:
        d["_id"] = str(d["_id"])
    return make_response(jsonify(docs),200)


# Remove property from favorites
@user_app.route("/favorites/<string:property_id>",methods=["DELETE"])
@jwt_required()
def remove_favorite(property_id):
    if ext.db is None:
        return make_response(jsonify({"Error":"Database not connected"}),500)
    
    coll = ext.db["biz"]
    res = coll.delete_one({"type":"favorite","user_id":_uid(),"property_id":property_id})
    if res.deleted_count == 0:
        return make_response(jsonify({"Error":"Favorite not found"}),404)
    return make_response(jsonify({"msg":"Removed from favorites"}),200)

# Send inquiry about a property
@user_app.route("/inquiries",methods=["POST"])
@jwt_required()
def send_inquiry():
    if ext.db is None:
        return make_response(jsonify({"Error":"Database not connected"}),500)
    
    data = get_data()
    pid = data.get("property_id")
    msg = data.get("message")
    if not pid or not msg:
        return make_response(jsonify({"Error":"property_id and message required"}),400)

    coll = ext.db["biz"]
    inquiry = {"type":"inquiry","user_id":_uid(),"property_id":pid,"message":msg}
    coll.insert_one(inquiry)
    return make_response(jsonify({"msg":"Inquiry sent"}),201)

# Get user's inquiries
@user_app.route("/inquiries",methods=["GET"])
@jwt_required()
def list_inquiries():
    if ext.db is None:
        return make_response(jsonify({"Error":"Database not connected"}),500)
    
    coll = ext.db["biz"]
    docs = list(coll.find({"type":"inquiry","user_id":_uid()}))
    for d in docs:
        d["_id"] = str(d["_id"])
    return make_response(jsonify(docs),200)
