from flask import Blueprint, request, jsonify, make_response
from flask_jwt_extended import jwt_required, get_jwt
from bson import ObjectId
from datetime import datetime
import app.extensions as ext

agent_app = Blueprint("agent", __name__)


def get_data():
    """
    Get request data from JSON or form.
    
    Returns:
        dict: Request data
    """
    return request.get_json() if request.is_json else request.form


def _agent_id():
    """
    Get current agent's ID from JWT.
    
    Returns:
        str: Agent's user ID
    """
    return get_jwt().get("user_id")


def _check_agent_role():
    """
    Check if user has agent or admin role.
    
    Returns:
        bool: True if user has agent or admin role
    """
    role = get_jwt().get("role", "user")
    return role in ["agent", "admin"]

# Create new property (agent only)
@agent_app.route("/properties", methods=["POST"])
@jwt_required()
def create_property():
    """
    Create a new property listing (agent/admin only).
    
    Request Body:
        title (str): Property title
        price (int): Monthly rent price
        location (str): Property location/district
        type (str, optional): Property type (default: "apartment")
        available (bool, optional): Availability status (default: true)
        
    Returns:
        201: Property created with id
        400: Missing required fields or invalid data
        403: Agent role required
        500: Database error
    """
    if ext.db is None:
        return make_response(jsonify({"error": "Database not connected"}), 500)
    
    # Check agent role
    if not _check_agent_role():
        return make_response(jsonify({"error": "Agent role required"}), 403)
    
    try:
        data = get_data()
        
        # Validate required fields
        title = data.get("title", "").strip()
        price = data.get("price")
        location = data.get("location", "").strip()
        
        if not title:
            return make_response(jsonify({"error": "Title is required"}), 400)
        
        if not price:
            return make_response(jsonify({"error": "Price is required"}), 400)
        
        if not location:
            return make_response(jsonify({"error": "Location is required"}), 400)
        
        # Validate price
        try:
            price = int(price)
            if price < 0:
                return make_response(jsonify({"error": "Price must be a positive number"}), 400)
        except (ValueError, TypeError):
            return make_response(jsonify({"error": "Price must be a valid number"}), 400)
        
        # Create property document with type="property" and agent_id
        coll = ext.db["biz"]
        new_doc = {
            "type": "property",
            "title": title,
            "price": price,
            "location": location,
            "property_type": data.get("type", "apartment"),
            "agent_id": _agent_id(),
            "available": data.get("available", True),
            "createdAt": datetime.utcnow()
        }
        
        res = coll.insert_one(new_doc)
        return make_response(jsonify({"msg": "Created", "id": str(res.inserted_id)}), 201)
        
    except Exception as e:
        return make_response(jsonify({"error": f"Failed to create property: {str(e)}"}), 500)

# Get agent's own properties
@agent_app.route("/properties", methods=["GET"])
@jwt_required()
def my_properties():
    """
    Get agent's own properties.
    
    Returns:
        200: List of agent's properties
        403: Agent role required
        500: Database error
    """
    if ext.db is None:
        return make_response(jsonify({"error": "Database not connected"}), 500)
    
    # Check agent role
    if not _check_agent_role():
        return make_response(jsonify({"error": "Agent role required"}), 403)
    
    try:
        coll = ext.db["biz"]
        docs = list(coll.find({"type": "property", "agent_id": _agent_id()}))
        
        for d in docs:
            d["_id"] = str(d["_id"])
        
        return make_response(jsonify(docs), 200)
        
    except Exception as e:
        return make_response(jsonify({"error": f"Failed to retrieve properties: {str(e)}"}), 500)


# Update agent's own property
@agent_app.route("/properties/<string:pid>", methods=["PUT", "PATCH"])
@jwt_required()
def update_property(pid):
    """
    Update agent's own property.
    
    Args:
        pid: Property ObjectId as string
        
    Request Body:
        title (str, optional): Property title
        price (int, optional): Monthly rent price
        location (str, optional): Property location
        property_type (str, optional): Property type
        available (bool, optional): Availability status
        
    Returns:
        200: Property updated
        400: Invalid property ID or data
        403: Agent role required
        404: Property not found or not owned by agent
        500: Database error
    """
    if ext.db is None:
        return make_response(jsonify({"error": "Database not connected"}), 500)
    
    # Check agent role
    if not _check_agent_role():
        return make_response(jsonify({"error": "Agent role required"}), 403)
    
    try:
        # Validate ObjectId format
        try:
            oid = ObjectId(pid)
        except Exception:
            return make_response(jsonify({"error": "Invalid property ID"}), 400)
        
        data = get_data()
        coll = ext.db["biz"]
        
        # Build update document
        update = {}
        for k in ["title", "price", "location", "available", "property_type"]:
            if k in data:
                if k == "price":
                    try:
                        price_val = int(data[k])
                        if price_val < 0:
                            return make_response(jsonify({"error": "Price must be a positive number"}), 400)
                        update[k] = price_val
                    except (ValueError, TypeError):
                        return make_response(jsonify({"error": "Price must be a valid number"}), 400)
                else:
                    update[k] = data[k]
        
        if not update:
            return make_response(jsonify({"error": "No valid fields to update"}), 400)
        
        # Update with ownership verification
        res = coll.update_one(
            {"_id": oid, "type": "property", "agent_id": _agent_id()},
            {"$set": update}
        )
        
        if res.matched_count == 0:
            return make_response(jsonify({"error": "Property not found or not owned by you"}), 404)
        
        return make_response(jsonify({"msg": "Updated"}), 200)
        
    except Exception as e:
        return make_response(jsonify({"error": f"Failed to update property: {str(e)}"}), 500)


# Delete agent's own property
@agent_app.route("/properties/<string:pid>", methods=["DELETE"])
@jwt_required()
def delete_property(pid):
    """
    Delete agent's own property.
    
    Args:
        pid: Property ObjectId as string
        
    Returns:
        200: Property deleted
        400: Invalid property ID
        403: Agent role required
        404: Property not found or not owned by agent
        500: Database error
    """
    if ext.db is None:
        return make_response(jsonify({"error": "Database not connected"}), 500)
    
    # Check agent role
    if not _check_agent_role():
        return make_response(jsonify({"error": "Agent role required"}), 403)
    
    try:
        # Validate ObjectId format
        try:
            oid = ObjectId(pid)
        except Exception:
            return make_response(jsonify({"error": "Invalid property ID"}), 400)
        
        coll = ext.db["biz"]
        
        # Delete with ownership verification
        res = coll.delete_one({"_id": oid, "type": "property", "agent_id": _agent_id()})
        
        if res.deleted_count == 0:
            return make_response(jsonify({"error": "Property not found or not owned by you"}), 404)
        
        return make_response(jsonify({"msg": "Deleted"}), 200)
        
    except Exception as e:
        return make_response(jsonify({"error": f"Failed to delete property: {str(e)}"}), 500)
