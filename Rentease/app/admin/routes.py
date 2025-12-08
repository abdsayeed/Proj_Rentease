# Admin routes - admin only operations
from flask import Blueprint, request, jsonify, make_response
from flask_jwt_extended import jwt_required, get_jwt
from bson import ObjectId
import app.extensions as ext

admin_app = Blueprint("admin", __name__)

# helper to get request data
def get_data():
    return request.get_json() if request.is_json else request.form

# check if user is admin
def _check_admin_role():
    role = get_jwt().get("role", "user")
    return role == "admin"


# GET /properties - all properties
@admin_app.route("/properties", methods=["GET"])
@jwt_required()
def admin_all_properties():
    if ext.db is None:
        return make_response(jsonify({"Error": "Database not connected"}), 500)
    
    if not _check_admin_role():
        return make_response(jsonify({"Error": "Admin role required"}), 403)
    
    coll = ext.db["biz"]
    docs = list(coll.find({"type": "property"}))
    for d in docs:
        d["_id"] = str(d["_id"])
    return make_response(jsonify(docs), 200)


# PUT /properties/<id> - update any property
@admin_app.route("/properties/<string:pid>", methods=["PUT", "PATCH"])
@jwt_required()
def admin_update_property(pid):
    if ext.db is None:
        return make_response(jsonify({"Error": "Database not connected"}), 500)
    
    if not _check_admin_role():
        return make_response(jsonify({"Error": "Admin role required"}), 403)
    
    data = get_data()
    coll = ext.db["biz"]

    try:
        oid = ObjectId(pid)
    except Exception:
        return make_response(jsonify({"Error": "Bad id"}), 400)

    update = {}
    for k in ["title", "price", "location", "available", "property_type"]:
        if k in data:
            update[k] = int(data[k]) if k == "price" else data[k]
    
    if not update:
        return make_response(jsonify({"Error": "No valid fields"}), 400)

    res = coll.update_one({"_id": oid, "type": "property"}, {"$set": update})
    if res.matched_count == 0:
        return make_response(jsonify({"Error": "Not found"}), 404)
    return make_response(jsonify({"msg": "Updated"}), 200)


# DELETE /properties/<id> - delete any property
@admin_app.route("/properties/<string:pid>", methods=["DELETE"])
@jwt_required()
def admin_delete_property(pid):
    if ext.db is None:
        return make_response(jsonify({"Error": "Database not connected"}), 500)
    
    if not _check_admin_role():
        return make_response(jsonify({"Error": "Admin role required"}), 403)
    
    coll = ext.db["biz"]
    try:
        oid = ObjectId(pid)
    except Exception:
        return make_response(jsonify({"Error": "Bad id"}), 400)

    res = coll.delete_one({"_id": oid, "type": "property"})
    if res.deleted_count == 0:
        return make_response(jsonify({"Error": "Not found"}), 404)
    return make_response(jsonify({"msg": "Deleted"}), 200)


# GET /users - all users
@admin_app.route("/users", methods=["GET"])
@jwt_required()
def admin_all_users():
    if ext.db is None:
        return make_response(jsonify({"Error": "Database not connected"}), 500)
    
    if not _check_admin_role():
        return make_response(jsonify({"Error": "Admin role required"}), 403)
    
    coll = ext.db["biz"]
    docs = list(coll.find({"type": "user"}, {"password_hash": 0}))
    for d in docs:
        d["_id"] = str(d["_id"])
    return make_response(jsonify(docs), 200)


# PUT /users/<id>/role - update user role
@admin_app.route("/users/<string:uid>/role", methods=["PUT"])
@jwt_required()
def set_user_role(uid):
    if ext.db is None:
        return make_response(jsonify({"Error": "Database not connected"}), 500)
    
    if not _check_admin_role():
        return make_response(jsonify({"Error": "Admin role required"}), 403)
    
    data = get_data()
    role = data.get("role")
    if not role:
        return make_response(jsonify({"Error": "role required"}), 400)

    coll = ext.db["biz"]
    try:
        oid = ObjectId(uid)
    except Exception:
        return make_response(jsonify({"Error": "Bad id"}), 400)

    res = coll.update_one({"_id": oid, "type": "user"}, {"$set": {"role": role}})
    if res.matched_count == 0:
        return make_response(jsonify({"Error": "User not found"}), 404)
    return make_response(jsonify({"msg": "Role updated"}), 200)


# GET /statistics - system stats
@admin_app.route("/statistics", methods=["GET"])
@jwt_required()
def statistics():
    if ext.db is None:
        return make_response(jsonify({"Error": "Database not connected"}), 500)
    
    if not _check_admin_role():
        return make_response(jsonify({"Error": "Admin role required"}), 403)
    
    coll = ext.db["biz"]
    stats = {
        "users": coll.count_documents({"type": "user"}),
        "properties": coll.count_documents({"type": "property"}),
        "favorites": coll.count_documents({"type": "favorite"}),
        "inquiries": coll.count_documents({"type": "inquiry"})
    }
    return make_response(jsonify(stats), 200)
