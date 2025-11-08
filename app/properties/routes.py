from flask import Blueprint,request,jsonify,make_response
from bson import ObjectId
import app.extensions as ext

properties_app = Blueprint("properties",__name__)

# Get request data from JSON or form
def get_data():
    return request.get_json() if request.is_json else request.form

# List all properties with optional filters
@properties_app.route("/",methods=["GET"])
def list_properties():
    if ext.db is None:
        return make_response(jsonify({"error":"Database not connected"}),500)
    
    coll = ext.db["biz"]
    query = {"type":"property"}

    district = request.args.get("district")
    prop_type = request.args.get("type")
    min_price = request.args.get("price_min",type=int)
    max_price = request.args.get("price_max",type=int)

    if district:
        query["location"] = district
    if prop_type:
        query["property_type"] = prop_type
    if min_price is not None or max_price is not None:
        query["price"] = {}
        if min_price is not None:
            query["price"]["$gte"] = min_price
        if max_price is not None:
            query["price"]["$lte"] = max_price

    docs = list(coll.find(query))
    for d in docs:
        d["_id"] = str(d["_id"])
    return make_response(jsonify(docs),200)


# Get single property by ID
@properties_app.route("/<string:prop_id>",methods=["GET"])
def get_property(prop_id):
    if ext.db is None:
        return make_response(jsonify({"error":"Database not connected"}),500)
    
    coll = ext.db["biz"]
    try:
        oid = ObjectId(prop_id)
    except Exception:
        return make_response(jsonify({"error":"Invalid property ID"}),400)

    prop = coll.find_one({"_id":oid,"type":"property"})
    if not prop:
        return make_response(jsonify({"error":"Property not found"}),404)

    prop["_id"] = str(prop["_id"])
    return make_response(jsonify(prop),200)


# Add new property
@properties_app.route("/",methods=["POST"])
def add_property():
    if ext.db is None:
        return make_response(jsonify({"error":"Database not connected"}),500)
    
    data = get_data()
    title = data.get("title")
    price = data.get("price")
    location = data.get("location")

    if not title or not price or not location:
        return make_response(jsonify({"error":"Missing required fields"}),400)

    try:
        price = int(price)
    except (ValueError,TypeError):
        return make_response(jsonify({"error":"Price must be a number"}),400)

    new_doc = {
        "type":"property",
        "title":title,
        "price":price,
        "location":location,
        "property_type":data.get("type","apartment"),
        "available":data.get("available",True)
    }
    coll = ext.db["biz"]
    res = coll.insert_one(new_doc)
    return make_response(jsonify({"message":"Property added","id":str(res.inserted_id)}),201)


# Update property
@properties_app.route("/<string:prop_id>",methods=["PUT"])
def update_property(prop_id):
    if ext.db is None:
        return make_response(jsonify({"error":"Database not connected"}),500)
    
    data = get_data()
    coll = ext.db["biz"]

    try:
        oid = ObjectId(prop_id)
    except Exception:
        return make_response(jsonify({"error":"Invalid property ID"}),400)

    update_data = {}
    for key in data:
        if key in ["title","price","location","property_type","available"]:
            if key == "price":
                try:
                    update_data[key] = int(data[key])
                except (ValueError,TypeError):
                    return make_response(jsonify({"error":"Price must be a number"}),400)
            else:
                update_data[key] = data[key]

    if not update_data:
        return make_response(jsonify({"error":"No valid fields to update"}),400)

    res = coll.update_one({"_id":oid,"type":"property"},{"$set":update_data})
    if res.matched_count == 0:
        return make_response(jsonify({"error":"Property not found"}),404)
    return make_response(jsonify({"message":"Property updated"}),200)

# Delete property
@properties_app.route("/<string:prop_id>",methods=["DELETE"])
def delete_property(prop_id):
    if ext.db is None:
        return make_response(jsonify({"error":"Database not connected"}),500)
    
    coll = ext.db["biz"]

    try:
        oid = ObjectId(prop_id)
    except Exception:
        return make_response(jsonify({"error":"Invalid property ID"}),400)

    res = coll.delete_one({"_id":oid,"type":"property"})
    if res.deleted_count == 0:
        return make_response(jsonify({"error":"Property not found"}),404)
    return make_response(jsonify({"message":"Property deleted"}),200)
