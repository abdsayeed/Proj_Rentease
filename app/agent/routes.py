from flask import Blueprint,request,jsonify,make_response
from flask_jwt_extended import jwt_required,get_jwt
from bson import ObjectId
import app.extensions as ext

agent_app = Blueprint("agent",__name__)

# Get request data from JSON or form
def get_data():
    return request.get_json() if request.is_json else request.form

# Get current agent's ID from JWT
def _agent_id():
    return get_jwt().get("user_id")

# Check if user has agent or admin role
def _check_agent_role():
    role = get_jwt().get("role","user")
    return role in ["agent","admin"]

# Create new property (agent only)
@agent_app.route("/properties",methods=["POST"])
@jwt_required()
def create_property():
    if ext.db is None:
        return make_response(jsonify({"Error":"Database not connected"}),500)
    
    if not _check_agent_role():
        return make_response(jsonify({"Error":"Agent role required"}),403)
    
    data = get_data()

    if not all(k in data for k in ("title","price","location")):
        return make_response(jsonify({"Error":"Missing required fields"}),400)

    coll = ext.db["biz"]
    new_doc = {
        "type":"property",
        "title":data.get("title"),
        "price":int(data.get("price")),
        "location":data.get("location"),
        "property_type":data.get("type","apartment"),
        "agent_id":_agent_id(),
        "available":data.get("available",True)
    }
    res = coll.insert_one(new_doc)
    return make_response(jsonify({"msg":"Created","id":str(res.inserted_id)}),201)

# Get agent's own properties
@agent_app.route("/properties",methods=["GET"])
@jwt_required()
def my_properties():
    if ext.db is None:
        return make_response(jsonify({"Error":"Database not connected"}),500)
    
    if not _check_agent_role():
        return make_response(jsonify({"Error":"Agent role required"}),403)
    
    coll = ext.db["biz"]
    docs = list(coll.find({"type":"property","agent_id":_agent_id()}))
    for d in docs:
        d["_id"] = str(d["_id"])
    return make_response(jsonify(docs),200)


# Update agent's own property
@agent_app.route("/properties/<string:pid>",methods=["PUT","PATCH"])
@jwt_required()
def update_property(pid):
    if ext.db is None:
        return make_response(jsonify({"Error":"Database not connected"}),500)
    
    if not _check_agent_role():
        return make_response(jsonify({"Error":"Agent role required"}),403)
    
    data = get_data()
    coll = ext.db["biz"]

    try:
        oid = ObjectId(pid)
    except Exception:
        return make_response(jsonify({"Error":"Bad id"}),400)

    update = {}
    for k in ["title","price","location","available","property_type"]:
        if k in data:
            update[k] = int(data[k]) if k == "price" else data[k]
    
    if not update:
        return make_response(jsonify({"Error":"No valid fields"}),400)

    res = coll.update_one({"_id":oid,"type":"property","agent_id":_agent_id()},{"$set":update})
    if res.matched_count == 0:
        return make_response(jsonify({"Error":"Not found or not owner"}),404)
    return make_response(jsonify({"msg":"Updated"}),200)


# Delete agent's own property
@agent_app.route("/properties/<string:pid>",methods=["DELETE"])
@jwt_required()
def delete_property(pid):
    if ext.db is None:
        return make_response(jsonify({"Error":"Database not connected"}),500)
    
    if not _check_agent_role():
        return make_response(jsonify({"Error":"Agent role required"}),403)
    
    coll = ext.db["biz"]
    try:
        oid = ObjectId(pid)
    except Exception:
        return make_response(jsonify({"Error":"Bad id"}),400)

    res = coll.delete_one({"_id":oid,"type":"property","agent_id":_agent_id()})
    if res.deleted_count == 0:
        return make_response(jsonify({"Error":"Not found or not owner"}),404)
    return make_response(jsonify({"msg":"Deleted"}),200)
