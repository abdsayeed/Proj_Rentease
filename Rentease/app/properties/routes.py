# Properties routes - CRUD for rental properties
from flask import Blueprint, request, jsonify, make_response
from bson import ObjectId
from datetime import datetime
import app.extensions as ext

properties_app = Blueprint("properties", __name__)

# helper to get request data
def get_data():
    return request.get_json() if request.is_json else request.form

# helper to create api response
def api_response(success, message, data=None, status_code=200):
    response = {"success": success, "message": message}
    if data is not None:
        response["data"] = data
    return make_response(jsonify(response), status_code)

# format property for frontend
def format_property(doc):
    return {
        "_id": str(doc["_id"]),
        "title": doc.get("title", ""),
        "description": doc.get("description", ""),
        "type": doc.get("property_type", "apartment"),
        "status": "available" if doc.get("available", True) else "rented",
        "price": doc.get("price", 0),
        "bedrooms": doc.get("bedrooms", 1),
        "bathrooms": doc.get("bathrooms", 1),
        "square_feet": doc.get("area", 0),
        "location": {
            "address": doc.get("location", ""),
            "city": doc.get("location", ""),
            "state": "",
            "country": "UK",
            "zip_code": "",
            "latitude": 0,
            "longitude": 0
        },
        "amenities": doc.get("amenities", []),
        "images": doc.get("images", []),
        "agent_id": doc.get("agent_id", ""),
        "created_at": doc.get("createdAt", datetime.utcnow().isoformat()),
        "updated_at": doc.get("updatedAt", datetime.utcnow().isoformat())
    }


# GET / - list all properties
@properties_app.route("/", methods=["GET"])
def list_properties():
    if ext.db is None:
        return api_response(False, "Database not connected", status_code=500)
    
    coll = ext.db["biz"]
    query = {"type": "property"}

    # apply filters
    district = request.args.get("district")
    city = request.args.get("city")
    prop_type = request.args.get("type")
    min_price = request.args.get("price_min", type=int)
    max_price = request.args.get("price_max", type=int)

    if district:
        query["location"] = district
    if city:
        query["location"] = city
    if prop_type:
        query["property_type"] = prop_type
    if min_price is not None or max_price is not None:
        query["price"] = {}
        if min_price is not None:
            query["price"]["$gte"] = min_price
        if max_price is not None:
            query["price"]["$lte"] = max_price

    docs = list(coll.find(query))
    properties = [format_property(d) for d in docs]
    return api_response(True, "Properties retrieved successfully", properties)


# GET /<id> - get single property
@properties_app.route("/<string:prop_id>", methods=["GET"])
def get_property(prop_id):
    if ext.db is None:
        return api_response(False, "Database not connected", status_code=500)
    
    coll = ext.db["biz"]
    try:
        oid = ObjectId(prop_id)
    except Exception:
        return api_response(False, "Invalid property ID", status_code=400)

    prop = coll.find_one({"_id": oid, "type": "property"})
    if not prop:
        return api_response(False, "Property not found", status_code=404)

    return api_response(True, "Property retrieved successfully", format_property(prop))


# POST / - add new property
@properties_app.route("/", methods=["POST"])
def add_property():
    if ext.db is None:
        return api_response(False, "Database not connected", status_code=500)
    
    data = get_data()
    title = data.get("title")
    price = data.get("price")
    location = data.get("location")

    if not title or not price or not location:
        return api_response(False, "Missing required fields", status_code=400)

    try:
        price = int(price)
    except (ValueError, TypeError):
        return api_response(False, "Price must be a number", status_code=400)

    new_doc = {
        "type": "property",
        "title": title,
        "description": data.get("description", ""),
        "price": price,
        "location": location,
        "property_type": data.get("type", "apartment"),
        "bedrooms": data.get("bedrooms", 1),
        "bathrooms": data.get("bathrooms", 1),
        "area": data.get("area", 0),
        "amenities": data.get("amenities", []),
        "images": data.get("images", []),
        "available": data.get("available", True),
        "agent_id": data.get("agent_id", ""),
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    }
    coll = ext.db["biz"]
    res = coll.insert_one(new_doc)
    new_doc["_id"] = res.inserted_id
    return api_response(True, "Property added successfully", format_property(new_doc), status_code=201)


# PUT /<id> - update property
@properties_app.route("/<string:prop_id>", methods=["PUT"])
def update_property(prop_id):
    if ext.db is None:
        return api_response(False, "Database not connected", status_code=500)
    
    data = get_data()
    coll = ext.db["biz"]

    try:
        oid = ObjectId(prop_id)
    except Exception:
        return api_response(False, "Invalid property ID", status_code=400)

    update_data = {"updatedAt": datetime.utcnow()}
    allowed_fields = ["title", "description", "price", "location", "property_type", 
                      "bedrooms", "bathrooms", "area", "amenities", "images", "available"]
    
    for key in data:
        if key in allowed_fields:
            if key == "price":
                try:
                    update_data[key] = int(data[key])
                except (ValueError, TypeError):
                    return api_response(False, "Price must be a number", status_code=400)
            else:
                update_data[key] = data[key]

    if len(update_data) == 1:
        return api_response(False, "No valid fields to update", status_code=400)

    res = coll.update_one({"_id": oid, "type": "property"}, {"$set": update_data})
    if res.matched_count == 0:
        return api_response(False, "Property not found", status_code=404)
    
    updated_prop = coll.find_one({"_id": oid})
    return api_response(True, "Property updated successfully", format_property(updated_prop))


# DELETE /<id> - delete property
@properties_app.route("/<string:prop_id>", methods=["DELETE"])
def delete_property(prop_id):
    if ext.db is None:
        return api_response(False, "Database not connected", status_code=500)
    
    coll = ext.db["biz"]

    try:
        oid = ObjectId(prop_id)
    except Exception:
        return api_response(False, "Invalid property ID", status_code=400)

    res = coll.delete_one({"_id": oid, "type": "property"})
    if res.deleted_count == 0:
        return api_response(False, "Property not found", status_code=404)
    return api_response(True, "Property deleted successfully")
