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
    """
    List all properties with optional filtering.
    
    Query Parameters:
        district (str, optional): Filter by location
        type (str, optional): Filter by property_type
        price_min (int, optional): Minimum price
        price_max (int, optional): Maximum price
        
    Returns:
        200: List of properties
        500: Database error
    """
    if ext.db is None:
        return make_response(jsonify({"error":"Database not connected"}),500)
    
    try:
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
        
    except Exception as e:
        return make_response(jsonify({"error": f"Failed to list properties: {str(e)}"}), 500)


# Get single property by ID
@properties_app.route("/<string:prop_id>",methods=["GET"])
def get_property(prop_id):
    """
    Get details of a single property.
    
    Args:
        prop_id: Property ObjectId as string
        
    Returns:
        200: Property details
        400: Invalid property ID
        404: Property not found
        500: Database error
    """
    if ext.db is None:
        return make_response(jsonify({"error":"Database not connected"}),500)
    
    try:
        # Validate ObjectId format
        try:
            oid = ObjectId(prop_id)
        except Exception:
            return make_response(jsonify({"error":"Invalid property ID"}),400)

        coll = ext.db["biz"]
        prop = coll.find_one({"_id":oid,"type":"property"})
        
        if not prop:
            return make_response(jsonify({"error":"Property not found"}),404)

        prop["_id"] = str(prop["_id"])
        return make_response(jsonify(prop),200)
        
    except Exception as e:
        return make_response(jsonify({"error": f"Failed to retrieve property: {str(e)}"}), 500)


# Add new property
@properties_app.route("/",methods=["POST"])
def add_property():
    """
    Create a new property listing.
    
    Request Body:
        title (str): Property title
        price (int): Monthly rent price
        location (str): Property location/district
        type (str, optional): Property type (default: "apartment")
        available (bool, optional): Availability status (default: true)
        
    Returns:
        201: Property created
        400: Missing required fields or invalid data
        500: Database error
    """
    if ext.db is None:
        return make_response(jsonify({"error":"Database not connected"}),500)
    
    try:
        data = get_data()
        title = data.get("title", "").strip()
        price = data.get("price")
        location = data.get("location", "").strip()

        # Validate required fields
        if not title:
            return make_response(jsonify({"error":"Title is required"}),400)
        
        if not price:
            return make_response(jsonify({"error":"Price is required"}),400)
        
        if not location:
            return make_response(jsonify({"error":"Location is required"}),400)

        # Validate price is a valid integer
        try:
            price = int(price)
            if price < 0:
                return make_response(jsonify({"error":"Price must be a positive number"}),400)
        except (ValueError,TypeError):
            return make_response(jsonify({"error":"Price must be a valid number"}),400)

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
        
    except Exception as e:
        return make_response(jsonify({"error": f"Failed to create property: {str(e)}"}), 500)


# Update property
@properties_app.route("/<string:prop_id>",methods=["PUT"])
def update_property(prop_id):
    """
    Update an existing property.
    
    Args:
        prop_id: Property ObjectId as string
        
    Request Body:
        title (str, optional): Property title
        price (int, optional): Monthly rent price
        location (str, optional): Property location
        property_type (str, optional): Property type
        available (bool, optional): Availability status
        
    Returns:
        200: Property updated
        400: Invalid property ID or data
        404: Property not found
        500: Database error
    """
    if ext.db is None:
        return make_response(jsonify({"error":"Database not connected"}),500)
    
    try:
        # Validate ObjectId format
        try:
            oid = ObjectId(prop_id)
        except Exception:
            return make_response(jsonify({"error":"Invalid property ID"}),400)

        data = get_data()
        coll = ext.db["biz"]

        update_data = {}
        for key in data:
            if key in ["title","price","location","property_type","available"]:
                if key == "price":
                    try:
                        price_val = int(data[key])
                        if price_val < 0:
                            return make_response(jsonify({"error":"Price must be a positive number"}),400)
                        update_data[key] = price_val
                    except (ValueError,TypeError):
                        return make_response(jsonify({"error":"Price must be a valid number"}),400)
                else:
                    update_data[key] = data[key]

        if not update_data:
            return make_response(jsonify({"error":"No valid fields to update"}),400)

        res = coll.update_one({"_id":oid,"type":"property"},{"$set":update_data})
        if res.matched_count == 0:
            return make_response(jsonify({"error":"Property not found"}),404)
        return make_response(jsonify({"message":"Property updated"}),200)
        
    except Exception as e:
        return make_response(jsonify({"error": f"Failed to update property: {str(e)}"}), 500)

# Delete property
@properties_app.route("/<string:prop_id>",methods=["DELETE"])
def delete_property(prop_id):
    """
    Delete a property.
    
    Args:
        prop_id: Property ObjectId as string
        
    Returns:
        200: Property deleted
        400: Invalid property ID
        404: Property not found
        500: Database error
    """
    if ext.db is None:
        return make_response(jsonify({"error":"Database not connected"}),500)
    
    try:
        # Validate ObjectId format
        try:
            oid = ObjectId(prop_id)
        except Exception:
            return make_response(jsonify({"error":"Invalid property ID"}),400)

        coll = ext.db["biz"]
        res = coll.delete_one({"_id":oid,"type":"property"})
        
        if res.deleted_count == 0:
            return make_response(jsonify({"error":"Property not found"}),404)
        return make_response(jsonify({"message":"Property deleted"}),200)
        
    except Exception as e:
        return make_response(jsonify({"error": f"Failed to delete property: {str(e)}"}), 500)
