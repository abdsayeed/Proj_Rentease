from flask import Blueprint, request, jsonify, make_response
from flask_jwt_extended import jwt_required, get_jwt
from bson import ObjectId
import app.extensions as ext

admin_app = Blueprint("admin", __name__)


def get_data():
    """
    Get request data from JSON or form.
    
    Returns:
        dict: Request data
    """
    return request.get_json() if request.is_json else request.form


def _check_admin_role():
    """
    Check if current user has admin role.
    
    Returns:
        bool: True if user has admin role
    """
    role = get_jwt().get("role", "user")
    return role == "admin"

# Get all properties (admin only)
@admin_app.route("/properties", methods=["GET"])
@jwt_required()
def admin_all_properties():
    """
    Get all properties (admin only).
    
    Returns:
        200: List of all properties
        403: Admin role required
        500: Database error
    """
    if ext.db is None:
        return make_response(jsonify({"error": "Database not connected"}), 500)
    
    # Check admin role
    if not _check_admin_role():
        return make_response(jsonify({"error": "Admin role required"}), 403)
    
    try:
        coll = ext.db["biz"]
        
        # Get all properties without ownership filter
        docs = list(coll.find({"type": "property"}))
        
        for d in docs:
            d["_id"] = str(d["_id"])
        
        return make_response(jsonify(docs), 200)
        
    except Exception as e:
        return make_response(jsonify({"error": f"Failed to retrieve properties: {str(e)}"}), 500)


# Update any property (admin only)
@admin_app.route("/properties/<string:pid>", methods=["PUT", "PATCH"])
@jwt_required()
def admin_update_property(pid):
    """
    Update any property (admin only).
    
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
        403: Admin role required
        404: Property not found
        500: Database error
    """
    if ext.db is None:
        return make_response(jsonify({"error": "Database not connected"}), 500)
    
    # Check admin role
    if not _check_admin_role():
        return make_response(jsonify({"error": "Admin role required"}), 403)
    
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
        
        # Update without ownership check (admin can update any property)
        res = coll.update_one({"_id": oid, "type": "property"}, {"$set": update})
        
        if res.matched_count == 0:
            return make_response(jsonify({"error": "Property not found"}), 404)
        
        return make_response(jsonify({"msg": "Updated"}), 200)
        
    except Exception as e:
        return make_response(jsonify({"error": f"Failed to update property: {str(e)}"}), 500)


# Delete any property (admin only)
@admin_app.route("/properties/<string:pid>", methods=["DELETE"])
@jwt_required()
def admin_delete_property(pid):
    """
    Delete any property (admin only).
    
    Args:
        pid: Property ObjectId as string
        
    Returns:
        200: Property deleted
        400: Invalid property ID
        403: Admin role required
        404: Property not found
        500: Database error
    """
    if ext.db is None:
        return make_response(jsonify({"error": "Database not connected"}), 500)
    
    # Check admin role
    if not _check_admin_role():
        return make_response(jsonify({"error": "Admin role required"}), 403)
    
    try:
        # Validate ObjectId format
        try:
            oid = ObjectId(pid)
        except Exception:
            return make_response(jsonify({"error": "Invalid property ID"}), 400)
        
        coll = ext.db["biz"]
        
        # Delete without ownership check (admin can delete any property)
        res = coll.delete_one({"_id": oid, "type": "property"})
        
        if res.deleted_count == 0:
            return make_response(jsonify({"error": "Property not found"}), 404)
        
        return make_response(jsonify({"msg": "Deleted"}), 200)
        
    except Exception as e:
        return make_response(jsonify({"error": f"Failed to delete property: {str(e)}"}), 500)


# Get all users (admin only)
@admin_app.route("/users", methods=["GET"])
@jwt_required()
def admin_all_users():
    """
    Get all users (admin only).
    
    Returns:
        200: List of all users (without password hashes)
        403: Admin role required
        500: Database error
    """
    if ext.db is None:
        return make_response(jsonify({"error": "Database not connected"}), 500)
    
    # Check admin role
    if not _check_admin_role():
        return make_response(jsonify({"error": "Admin role required"}), 403)
    
    try:
        # Query users collection (not biz collection)
        coll = ext.db["users"]
        docs = list(coll.find({}, {"password_hash": 0}))
        
        for d in docs:
            d["_id"] = str(d["_id"])
        
        return make_response(jsonify(docs), 200)
        
    except Exception as e:
        return make_response(jsonify({"error": f"Failed to retrieve users: {str(e)}"}), 500)


# Update user role (admin only)
@admin_app.route("/users/<string:uid>/role", methods=["PUT"])
@jwt_required()
def set_user_role(uid):
    """
    Update user role (admin only).
    
    Args:
        uid: User ObjectId as string
        
    Request Body:
        role (str): New role ('user', 'agent', or 'admin')
        
    Returns:
        200: Role updated
        400: Invalid user ID or missing role
        403: Admin role required
        404: User not found
        500: Database error
    """
    if ext.db is None:
        return make_response(jsonify({"error": "Database not connected"}), 500)
    
    # Check admin role
    if not _check_admin_role():
        return make_response(jsonify({"error": "Admin role required"}), 403)
    
    try:
        data = get_data()
        role = data.get("role", "").strip()
        
        # Validate required field
        if not role:
            return make_response(jsonify({"error": "role is required"}), 400)
        
        # Validate role value
        if role not in ["user", "agent", "admin"]:
            return make_response(jsonify({"error": "Invalid role. Must be 'user', 'agent', or 'admin'"}), 400)
        
        # Validate ObjectId format
        try:
            oid = ObjectId(uid)
        except Exception:
            return make_response(jsonify({"error": "Invalid user ID"}), 400)
        
        # Update in users collection (not biz collection)
        coll = ext.db["users"]
        res = coll.update_one({"_id": oid}, {"$set": {"role": role}})
        
        if res.matched_count == 0:
            return make_response(jsonify({"error": "User not found"}), 404)
        
        return make_response(jsonify({"msg": "Role updated"}), 200)
        
    except Exception as e:
        return make_response(jsonify({"error": f"Failed to update user role: {str(e)}"}), 500)


# Get system statistics (admin only)
@admin_app.route("/statistics", methods=["GET"])
@jwt_required()
def statistics():
    """
    Get system statistics (admin only).
    
    Returns:
        200: Statistics object with counts
        403: Admin role required
        500: Database error
        
    Response:
        {
            "users": int,
            "properties": int,
            "favorites": int,
            "inquiries": int
        }
    """
    if ext.db is None:
        return make_response(jsonify({"error": "Database not connected"}), 500)
    
    # Check admin role
    if not _check_admin_role():
        return make_response(jsonify({"error": "Admin role required"}), 403)
    
    try:
        # Get accurate counts from appropriate collections
        users_coll = ext.db["users"]
        biz_coll = ext.db["biz"]
        
        stats = {
            "users": users_coll.count_documents({}),
            "properties": biz_coll.count_documents({"type": "property"}),
            "favorites": biz_coll.count_documents({"type": "favorite"}),
            "inquiries": biz_coll.count_documents({"type": "inquiry"})
        }
        
        return make_response(jsonify(stats), 200)
        
    except Exception as e:
        return make_response(jsonify({"error": f"Failed to retrieve statistics: {str(e)}"}), 500)