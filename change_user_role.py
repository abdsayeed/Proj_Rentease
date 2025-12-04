"""
Script to change a user's role in the database
Usage: python change_user_role.py <email> <new_role>
Example: python change_user_role.py user@example.com agent
"""

import sys
from pymongo import MongoClient

def change_user_role(email, new_role):
    """Change a user's role in the database"""
    
    # Valid roles
    valid_roles = ['user', 'agent', 'admin']
    
    if new_role not in valid_roles:
        print(f"Error: Invalid role '{new_role}'. Must be one of: {', '.join(valid_roles)}")
        return False
    
    try:
        # Connect to MongoDB
        client = MongoClient('mongodb://127.0.0.1:27017/')
        db = client['rentease']
        users_collection = db['users']
        
        # Find user
        user = users_collection.find_one({"email": email})
        
        if not user:
            print(f"Error: User with email '{email}' not found")
            return False
        
        # Update role
        result = users_collection.update_one(
            {"email": email},
            {"$set": {"role": new_role}}
        )
        
        if result.modified_count > 0:
            print(f"✓ Successfully changed role for '{email}' to '{new_role}'")
            print(f"  User ID: {user['_id']}")
            print(f"  Old role: {user.get('role', 'N/A')}")
            print(f"  New role: {new_role}")
            return True
        else:
            print(f"No changes made. User already has role '{new_role}'")
            return True
            
    except Exception as e:
        print(f"Error: {str(e)}")
        return False
    finally:
        client.close()

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python change_user_role.py <email> <new_role>")
        print("Example: python change_user_role.py user@example.com agent")
        print("Valid roles: user, agent, admin")
        sys.exit(1)
    
    email = sys.argv[1]
    new_role = sys.argv[2]
    
    success = change_user_role(email, new_role)
    sys.exit(0 if success else 1)
