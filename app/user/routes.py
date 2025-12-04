from flask import Blueprint, request, jsonify, make_response
from flask_jwt_extended import jwt_required, get_jwt
from datetime import datetime
import app.extensions as ext

user_app = Blueprint("user", __name__)


def get_data():
    """
    Get request data from JSON or form.
    
    Returns:
        dict: Request data
    """
    return request.get_json() if request.is_json else request.form


def _uid():
    """
    Get current user's ID from JWT.
    
    Returns:
        str: User's ID
    """
    return get_jwt().get("user_id")

# Add property to favorites
@user_app.route("/favorites", methods=["POST"])
@jwt_required()
def add_favorite():
    """
    Add a property to user's favorites.
    
    Request Body:
        property_id (str): Property ObjectId as string
        
    Returns:
        201: Added to favorites
        200: Already in favorites
        400: Missing property_id
        500: Database error
    """
    if ext.db is None:
        return make_response(jsonify({"error": "Database not connected"}), 500)
    
    try:
        data = get_data()
        pid = data.get("property_id", "").strip()
        
        # Validate required field
        if not pid:
            return make_response(jsonify({"error": "property_id is required"}), 400)
        
        coll = ext.db["biz"]
        
        # Check if already in favorites (prevent duplicates)
        existing = coll.find_one({"type": "favorite", "user_id": _uid(), "property_id": pid})
        if existing:
            return make_response(jsonify({"msg": "Already in favorites"}), 200)
        
        # Create favorite document with type="favorite"
        fav = {
            "type": "favorite",
            "user_id": _uid(),
            "property_id": pid,
            "createdAt": datetime.utcnow()
        }
        coll.insert_one(fav)
        
        return make_response(jsonify({"msg": "Added to favorites"}), 201)
        
    except Exception as e:
        return make_response(jsonify({"error": f"Failed to add favorite: {str(e)}"}), 500)


# Get user's favorites
@user_app.route("/favorites", methods=["GET"])
@jwt_required()
def list_favorites():
    """
    Get user's favorites.
    
    Returns:
        200: List of user's favorites
        500: Database error
    """
    if ext.db is None:
        return make_response(jsonify({"error": "Database not connected"}), 500)
    
    try:
        coll = ext.db["biz"]
        
        # Query only current user's favorites
        docs = list(coll.find({"type": "favorite", "user_id": _uid()}))
        
        for d in docs:
            d["_id"] = str(d["_id"])
        
        return make_response(jsonify(docs), 200)
        
    except Exception as e:
        return make_response(jsonify({"error": f"Failed to retrieve favorites: {str(e)}"}), 500)


# Remove property from favorites
@user_app.route("/favorites/<string:property_id>", methods=["DELETE"])
@jwt_required()
def remove_favorite(property_id):
    """
    Remove property from favorites.
    
    Args:
        property_id: Property ID to remove
        
    Returns:
        200: Removed from favorites
        404: Favorite not found
        500: Database error
    """
    if ext.db is None:
        return make_response(jsonify({"error": "Database not connected"}), 500)
    
    try:
        coll = ext.db["biz"]
        
        # Delete only current user's favorite
        res = coll.delete_one({"type": "favorite", "user_id": _uid(), "property_id": property_id})
        
        if res.deleted_count == 0:
            return make_response(jsonify({"error": "Favorite not found"}), 404)
        
        return make_response(jsonify({"msg": "Removed from favorites"}), 200)
        
    except Exception as e:
        return make_response(jsonify({"error": f"Failed to remove favorite: {str(e)}"}), 500)

# Send inquiry about a property
@user_app.route("/inquiries", methods=["POST"])
@jwt_required()
def send_inquiry():
    """
    Send an inquiry about a property.
    
    Request Body:
        property_id (str): Property ObjectId as string
        message (str): Inquiry message
        
    Returns:
        201: Inquiry sent
        400: Missing required fields
        500: Database error
    """
    if ext.db is None:
        return make_response(jsonify({"error": "Database not connected"}), 500)
    
    try:
        data = get_data()
        pid = data.get("property_id", "").strip()
        msg = data.get("message", "").strip()
        
        # Validate required fields
        if not pid:
            return make_response(jsonify({"error": "property_id is required"}), 400)
        
        if not msg:
            return make_response(jsonify({"error": "message is required"}), 400)
        
        coll = ext.db["biz"]
        
        # Create inquiry document with type="inquiry"
        inquiry = {
            "type": "inquiry",
            "user_id": _uid(),
            "property_id": pid,
            "message": msg,
            "createdAt": datetime.utcnow()
        }
        coll.insert_one(inquiry)
        
        return make_response(jsonify({"msg": "Inquiry sent"}), 201)
        
    except Exception as e:
        return make_response(jsonify({"error": f"Failed to send inquiry: {str(e)}"}), 500)

# Get user's inquiries
@user_app.route("/inquiries", methods=["GET"])
@jwt_required()
def list_inquiries():
    """
    Get user's inquiries.
    
    Returns:
        200: List of user's inquiries
        500: Database error
    """
    if ext.db is None:
        return make_response(jsonify({"error": "Database not connected"}), 500)
    
    try:
        coll = ext.db["biz"]
        
        # Query only current user's inquiries
        docs = list(coll.find({"type": "inquiry", "user_id": _uid()}))
        
        for d in docs:
            d["_id"] = str(d["_id"])
        
        return make_response(jsonify(docs), 200)
        
    except Exception as e:
        return make_response(jsonify({"error": f"Failed to retrieve inquiries: {str(e)}"}), 500)
