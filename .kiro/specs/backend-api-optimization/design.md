# Design Document

## Overview

The Rentease backend API optimization focuses on enhancing the existing Flask application to meet production-ready standards. The design maintains the current modular blueprint architecture while adding comprehensive error handling, input validation, proper HTTP status codes, and ensuring alignment with the Angular frontend's expectations.

The backend serves as the REST API layer between the Angular frontend and MongoDB database, handling authentication, authorization, and all business logic for the property rental platform.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Angular Frontend                          │
│                   (localhost:4300)                           │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/REST + JWT
                         │
┌────────────────────────▼────────────────────────────────────┐
│                    Flask Backend                             │
│                  (127.0.0.1:5000)                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Application Factory (create_app)                     │  │
│  │  - CORS Configuration                                 │  │
│  │  - Extension Initialization                           │  │
│  │  - Blueprint Registration                             │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │   Auth   │ │Properties│ │   User   │ │  Agent   │      │
│  │ Blueprint│ │Blueprint │ │Blueprint │ │Blueprint │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│                                                              │
│  ┌──────────┐ ┌──────────────────────────────────────┐    │
│  │  Admin   │ │      Extensions Layer                 │    │
│  │Blueprint │ │  - PyMongo Client                     │    │
│  └──────────┘ │  - JWT Manager                        │    │
│               └──────────────────────────────────────┘    │
└────────────────────────┬────────────────────────────────────┘
                         │ PyMongo Driver
                         │
┌────────────────────────▼────────────────────────────────────┐
│                    MongoDB                                   │
│                 (localhost:27017)                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                   │
│  │  users   │ │   biz    │ │blacklist │                   │
│  │collection│ │collection│ │collection│                   │
│  └──────────┘ └──────────┘ └──────────┘                   │
└─────────────────────────────────────────────────────────────┘
```

### Blueprint Architecture

The application uses Flask's blueprint pattern to organize routes into logical modules:

- **auth**: User registration and login (`/auth`)
- **properties**: Public property CRUD operations (`/api/v1/properties`)
- **user**: User-specific operations - favorites and inquiries (`/api/v1/users`)
- **agent**: Agent property management (`/api/v1/agent`)
- **admin**: Administrative operations (`/api/v1/admin`)

Each blueprint is self-contained with its own routes and business logic, registered with specific URL prefixes in the application factory.

## Components and Interfaces

### 1. Application Factory (`app/__init__.py`)

**Purpose**: Initialize and configure the Flask application using the factory pattern.

**Responsibilities**:
- Create Flask application instance
- Configure CORS to allow frontend requests from localhost:4300
- Initialize extensions (MongoDB, JWT)
- Register all blueprints with appropriate URL prefixes
- Provide health check endpoint

**Interface**:
```python
def create_app() -> Flask:
    """
    Creates and configures the Flask application.
    
    Returns:
        Flask: Configured Flask application instance
    """
```

### 2. Extensions Module (`app/extensions.py`)

**Purpose**: Initialize and manage shared extensions (database and JWT).

**Responsibilities**:
- Configure JWT with secret key and token expiration
- Establish MongoDB connection with error handling
- Create required collections if they don't exist
- Provide global database instance to blueprints

**Interface**:
```python
jwt: JWTManager  # Global JWT manager instance
mongo_client: MongoClient  # Global MongoDB client
db: Database  # Global database instance

def init_extensions(app: Flask) -> Database:
    """
    Initializes extensions for the Flask app.
    
    Args:
        app: Flask application instance
        
    Returns:
        Database: MongoDB database instance
        
    Raises:
        ServerSelectionTimeoutError: If MongoDB connection fails
    """
```

### 3. Authentication Blueprint (`app/auth/routes.py`)

**Purpose**: Handle user registration and login.

**Endpoints**:
- `POST /auth/register`: Register new user
- `POST /auth/login`: Authenticate user and issue JWT

**Key Functions**:
```python
def register_user() -> tuple[Response, int]:
    """
    Register a new user account.
    
    Request Body:
        email (str): User email address
        password (str): User password
        role (str, optional): User role (default: "user")
        
    Returns:
        201: User created successfully
        400: Missing required fields
        409: User already exists
        500: Database error
    """

def login_user() -> tuple[Response, int]:
    """
    Authenticate user and generate JWT token.
    
    Request Body:
        email (str): User email address
        password (str): User password
        
    Returns:
        200: Login successful with access_token
        400: Missing required fields
        401: Invalid credentials
        500: Database error
    """
```

### 4. Properties Blueprint (`app/properties/routes.py`)

**Purpose**: Handle public property operations (CRUD).

**Endpoints**:
- `GET /api/v1/properties/`: List properties with optional filters
- `GET /api/v1/properties/<id>`: Get single property details
- `POST /api/v1/properties/`: Create new property
- `PUT /api/v1/properties/<id>`: Update property
- `DELETE /api/v1/properties/<id>`: Delete property

**Key Functions**:
```python
def list_properties() -> tuple[Response, int]:
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

def get_property(prop_id: str) -> tuple[Response, int]:
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
```

### 5. User Blueprint (`app/user/routes.py`)

**Purpose**: Handle user-specific operations (favorites and inquiries).

**Endpoints**:
- `POST /api/v1/users/favorites`: Add property to favorites
- `GET /api/v1/users/favorites`: List user's favorites
- `DELETE /api/v1/users/favorites/<property_id>`: Remove from favorites
- `POST /api/v1/users/inquiries`: Send property inquiry
- `GET /api/v1/users/inquiries`: List user's inquiries

**Authentication**: All endpoints require valid JWT token.

**Key Functions**:
```python
@jwt_required()
def add_favorite() -> tuple[Response, int]:
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

@jwt_required()
def send_inquiry() -> tuple[Response, int]:
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
```

### 6. Agent Blueprint (`app/agent/routes.py`)

**Purpose**: Handle agent-specific property management.

**Endpoints**:
- `POST /api/v1/agent/properties`: Create property (agent only)
- `GET /api/v1/agent/properties`: List agent's properties
- `PUT /api/v1/agent/properties/<id>`: Update agent's property
- `DELETE /api/v1/agent/properties/<id>`: Delete agent's property

**Authentication**: All endpoints require JWT with agent or admin role.

**Key Functions**:
```python
@jwt_required()
def create_property() -> tuple[Response, int]:
    """
    Create a new property listing (agent/admin only).
    
    Request Body:
        title (str): Property title
        price (int): Monthly rent price
        location (str): Property location/district
        type (str, optional): Property type (default: "apartment")
        available (bool, optional): Availability status (default: true)
        
    Returns:
        201: Property created
        400: Missing required fields
        403: Agent role required
        500: Database error
    """
```

### 7. Admin Blueprint (`app/admin/routes.py`)

**Purpose**: Handle administrative operations.

**Endpoints**:
- `GET /api/v1/admin/properties`: List all properties
- `PUT /api/v1/admin/properties/<id>`: Update any property
- `DELETE /api/v1/admin/properties/<id>`: Delete any property
- `GET /api/v1/admin/users`: List all users
- `PUT /api/v1/admin/users/<id>/role`: Update user role
- `GET /api/v1/admin/statistics`: Get system statistics

**Authentication**: All endpoints require JWT with admin role.

**Key Functions**:
```python
@jwt_required()
def statistics() -> tuple[Response, int]:
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
```

## Data Models

### User Document (users collection)

```python
{
    "_id": ObjectId,           # MongoDB generated ID
    "email": str,              # Unique user email
    "password_hash": bytes,    # Bcrypt hashed password
    "role": str,               # "user" | "agent" | "admin"
    "createdAt": datetime      # Account creation timestamp
}
```

### Property Document (biz collection)

```python
{
    "_id": ObjectId,           # MongoDB generated ID
    "type": "property",        # Document type discriminator
    "title": str,              # Property title
    "description": str,        # Property description (optional)
    "price": int,              # Monthly rent price
    "location": str,           # District/location
    "property_type": str,      # "apartment" | "house" | "flat" | "studio" | "penthouse"
    "bedrooms": int,           # Number of bedrooms (optional)
    "bathrooms": int,          # Number of bathrooms (optional)
    "area": int,               # Square footage (optional)
    "amenities": list[str],    # List of amenities (optional)
    "images": list[str],       # List of image URLs (optional)
    "agent_id": str,           # Agent's user ID (ObjectId as string)
    "available": bool,         # Availability status
    "createdAt": datetime,     # Creation timestamp
    "updatedAt": datetime      # Last update timestamp
}
```

### Favorite Document (biz collection)

```python
{
    "_id": ObjectId,           # MongoDB generated ID
    "type": "favorite",        # Document type discriminator
    "user_id": str,            # User's ID (ObjectId as string)
    "property_id": str,        # Property's ID (ObjectId as string)
    "createdAt": datetime      # Timestamp when favorited
}
```

### Inquiry Document (biz collection)

```python
{
    "_id": ObjectId,           # MongoDB generated ID
    "type": "inquiry",         # Document type discriminator
    "user_id": str,            # User's ID (ObjectId as string)
    "property_id": str,        # Property's ID (ObjectId as string)
    "agent_id": str,           # Agent's ID (optional)
    "message": str,            # Inquiry message
    "status": str,             # "pending" | "responded" | "closed"
    "createdAt": datetime      # Timestamp when sent
}
```

### JWT Token Payload

```python
{
    "identity": str,           # User ID (ObjectId as string)
    "role": str,               # User role ("user" | "agent" | "admin")
    "user_id": str,            # User ID (ObjectId as string) - duplicate for convenience
    "exp": int                 # Expiration timestamp (24 hours from creation)
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Password hashing on registration
*For any* user registration with a valid password, the password stored in the database should be a bcrypt hash, not the plain text password.
**Validates: Requirements 3.1**

### Property 2: Duplicate email rejection
*For any* registration attempt with an email that already exists in the database, the system should return HTTP 409 Conflict.
**Validates: Requirements 3.2**

### Property 3: JWT token structure on login
*For any* successful login, the generated JWT token payload should contain identity, role, and user_id fields, all as string values.
**Validates: Requirements 3.3**

### Property 4: Invalid credentials rejection
*For any* login attempt with invalid credentials (wrong password or non-existent email), the system should return HTTP 401 Unauthorized.
**Validates: Requirements 3.4**

### Property 5: Property type filtering
*For any* property listing request, all returned documents should have type field equal to "property".
**Validates: Requirements 4.1**

### Property 6: Filter criteria matching
*For any* property listing request with filters (district, property_type, price_min, price_max), all returned properties should match the specified filter criteria.
**Validates: Requirements 4.2**

### Property 7: Property retrieval or 404
*For any* property ID request, the system should either return the property document if it exists, or HTTP 404 if it does not exist.
**Validates: Requirements 4.3**

### Property 8: Invalid ObjectId handling
*For any* string that cannot be converted to a valid MongoDB ObjectId format, the system should return HTTP 400 Bad Request.
**Validates: Requirements 4.4, 9.4**

### Property 9: Agent role verification for property creation
*For any* property creation attempt, if the authenticated user does not have agent or admin role, the system should return HTTP 403 Forbidden.
**Validates: Requirements 5.1, 5.3**

### Property 10: Property document structure
*For any* property created by an agent, the saved document should have type="property" and include the agent_id field with the creator's user ID.
**Validates: Requirements 5.2**

### Property 11: Property ownership verification for updates
*For any* agent property update attempt, if the agent does not own the property (agent_id does not match), the system should return HTTP 404 or prevent the update.
**Validates: Requirements 5.4**

### Property 12: Property ownership verification for deletion
*For any* agent property deletion attempt, if the agent does not own the property (agent_id does not match), the system should return HTTP 404 or prevent the deletion.
**Validates: Requirements 5.5**

### Property 13: Favorite document structure
*For any* favorite added by a user, the saved document should have type="favorite" and include both user_id and property_id fields.
**Validates: Requirements 6.1**

### Property 14: Duplicate favorite prevention
*For any* favorite that already exists (same user_id and property_id), attempting to add it again should not create a duplicate document.
**Validates: Requirements 6.2**

### Property 15: User-specific favorites filtering
*For any* authenticated user requesting their favorites, all returned documents should have user_id matching the authenticated user's ID.
**Validates: Requirements 6.3**

### Property 16: Inquiry document structure
*For any* inquiry sent by a user, the saved document should have type="inquiry" and include user_id, property_id, and message fields.
**Validates: Requirements 6.4**

### Property 17: Admin property access without ownership filter
*For any* admin requesting all properties, the system should return all property documents regardless of agent_id ownership.
**Validates: Requirements 7.1**

### Property 18: Admin property modification without ownership check
*For any* admin updating or deleting a property, the operation should succeed regardless of who owns the property.
**Validates: Requirements 7.2, 7.3**

### Property 19: Admin role verification
*For any* admin operation attempt, if the authenticated user does not have admin role, the system should return HTTP 403 Forbidden.
**Validates: Requirements 7.4**

### Property 20: Statistics accuracy
*For any* admin statistics request, the returned counts should accurately reflect the number of documents of each type in the database.
**Validates: Requirements 7.5**

### Property 21: Required field validation
*For any* API request that requires specific fields (email, password, property_id, message, etc.), if any required field is missing or empty, the system should return HTTP 400 Bad Request before attempting database operations.
**Validates: Requirements 3.5, 5.6, 6.5, 9.1, 9.5**

### Property 22: Price validation
*For any* request containing a price field, if the price cannot be converted to a valid integer, the system should return HTTP 400 Bad Request.
**Validates: Requirements 9.3**

### Property 23: Password truncation for bcrypt
*For any* password provided during registration or login, the system should truncate it to 72 bytes before bcrypt processing.
**Validates: Requirements 9.2**

### Property 24: HTTP status code consistency
*For any* error condition, the system should return the appropriate HTTP status code: 400 for validation errors, 401 for authentication failures, 403 for authorization failures, 404 for not found, and 500 for server errors.
**Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5**

### Property 25: Error response structure consistency
*For any* error response, the JSON body should contain an error message field (either "error" or "Error" key) with a descriptive message.
**Validates: Requirements 8.6**

## Error Handling

### Error Handling Strategy

The backend implements a comprehensive error handling strategy with consistent HTTP status codes and error response formats:

**HTTP Status Codes**:
- **200 OK**: Successful GET, PUT, DELETE operations
- **201 Created**: Successful POST operations that create resources
- **400 Bad Request**: Invalid input, validation failures, malformed data
- **401 Unauthorized**: Missing or invalid authentication credentials
- **403 Forbidden**: Valid authentication but insufficient permissions
- **404 Not Found**: Requested resource does not exist
- **409 Conflict**: Resource already exists (e.g., duplicate email)
- **500 Internal Server Error**: Database errors, unexpected server errors

**Error Response Format**:
All error responses follow a consistent JSON structure:
```python
{
    "error": "Descriptive error message"  # or "Error" key
}
```

### Error Handling Patterns

**1. Database Connection Errors**:
```python
if ext.db is None:
    return make_response(jsonify({"error": "Database not connected"}), 500)
```

**2. Validation Errors**:
```python
if not email or not password:
    return make_response(jsonify({"error": "Email and password required"}), 400)
```

**3. ObjectId Conversion Errors**:
```python
try:
    oid = ObjectId(prop_id)
except Exception:
    return make_response(jsonify({"error": "Invalid property ID"}), 400)
```

**4. Resource Not Found**:
```python
if not prop:
    return make_response(jsonify({"error": "Property not found"}), 404)
```

**5. Authorization Errors**:
```python
if not _check_agent_role():
    return make_response(jsonify({"error": "Agent role required"}), 403)
```

**6. MongoDB Operation Errors**:
All database operations should be wrapped in try-except blocks:
```python
try:
    result = coll.insert_one(document)
    return make_response(jsonify({"msg": "Success", "id": str(result.inserted_id)}), 201)
except Exception as e:
    return make_response(jsonify({"error": f"Database error: {str(e)}"}), 500)
```

### Input Validation

**Pre-Database Validation**:
All inputs must be validated before database operations:

1. **Required Fields**: Check for presence and non-empty values
2. **Type Validation**: Ensure correct data types (int for price, str for text fields)
3. **Format Validation**: Validate ObjectId format, email format (basic check)
4. **Length Limits**: Truncate passwords to 72 bytes for bcrypt compatibility

**Validation Order**:
1. Check database connection
2. Validate authentication/authorization
3. Validate required fields presence
4. Validate data types and formats
5. Perform database operation
6. Handle database errors

## Testing Strategy

### Unit Testing

Unit tests will verify specific behaviors and edge cases for each endpoint:

**Authentication Tests**:
- Register with valid data creates user
- Register with existing email returns 409
- Login with valid credentials returns token
- Login with invalid credentials returns 401
- Missing email or password returns 400

**Property Tests**:
- List properties returns only type="property" documents
- Filters correctly apply to property queries
- Get property with valid ID returns property
- Get property with invalid ID returns 400
- Get non-existent property returns 404
- Create property with valid data succeeds
- Update property with valid data succeeds
- Delete property removes document

**User Tests**:
- Add favorite creates favorite document
- Duplicate favorite doesn't create duplicate
- List favorites returns only user's favorites
- Remove favorite deletes document
- Send inquiry creates inquiry document

**Agent Tests**:
- Non-agent cannot create property (403)
- Agent can create property with agent_id
- Agent can only update own properties
- Agent can only delete own properties

**Admin Tests**:
- Non-admin cannot access admin endpoints (403)
- Admin can view all properties
- Admin can update any property
- Admin can delete any property
- Statistics returns accurate counts

### Property-Based Testing

Property-based tests will verify universal properties across many randomly generated inputs using the **Hypothesis** library for Python.

**Configuration**:
- Minimum 100 iterations per property test
- Use Hypothesis strategies for generating test data
- Each property test tagged with design document reference

**Test Data Generators**:
```python
from hypothesis import given, strategies as st

# User data generator
@st.composite
def user_data(draw):
    return {
        "email": draw(st.emails()),
        "password": draw(st.text(min_size=8, max_size=100)),
        "role": draw(st.sampled_from(["user", "agent", "admin"]))
    }

# Property data generator
@st.composite
def property_data(draw):
    return {
        "title": draw(st.text(min_size=1, max_size=200)),
        "price": draw(st.integers(min_value=100, max_value=100000)),
        "location": draw(st.sampled_from(["Mayfair", "Chelsea", "Kensington"])),
        "property_type": draw(st.sampled_from(["apartment", "house", "flat", "studio"])),
        "available": draw(st.booleans())
    }

# ObjectId string generator (valid and invalid)
@st.composite
def object_id_strings(draw, valid=True):
    if valid:
        return str(ObjectId())
    else:
        return draw(st.text(min_size=1, max_size=24))
```

**Property Test Examples**:

```python
@given(user_data())
def test_property_1_password_hashing(user_data):
    """
    Feature: backend-api-optimization, Property 1: Password hashing on registration
    """
    # Register user
    response = client.post('/auth/register', json=user_data)
    
    # Retrieve user from database
    user = db.users.find_one({"email": user_data["email"]})
    
    # Assert password is hashed, not plain text
    assert user["password_hash"] != user_data["password"].encode('utf-8')
    assert bcrypt.checkpw(user_data["password"].encode('utf-8')[:72], user["password_hash"])

@given(property_data(), st.sampled_from(["district", "property_type", "price_min", "price_max"]))
def test_property_6_filter_criteria_matching(property_data, filter_type):
    """
    Feature: backend-api-optimization, Property 6: Filter criteria matching
    """
    # Create property
    db.biz.insert_one({**property_data, "type": "property"})
    
    # Build filter query
    filters = {}
    if filter_type == "district":
        filters["district"] = property_data["location"]
    elif filter_type == "property_type":
        filters["type"] = property_data["property_type"]
    elif filter_type == "price_min":
        filters["price_min"] = property_data["price"] - 100
    elif filter_type == "price_max":
        filters["price_max"] = property_data["price"] + 100
    
    # Query with filters
    response = client.get('/api/v1/properties/', query_string=filters)
    properties = response.json
    
    # Assert all results match filter criteria
    for prop in properties:
        if "district" in filters:
            assert prop["location"] == filters["district"]
        if "type" in filters:
            assert prop["property_type"] == filters["type"]
        if "price_min" in filters:
            assert prop["price"] >= filters["price_min"]
        if "price_max" in filters:
            assert prop["price"] <= filters["price_max"]
```

**Property Test Tags**:
Each property-based test must include a comment with the format:
```python
"""
Feature: backend-api-optimization, Property {number}: {property_text}
"""
```

### Integration Testing

Integration tests will verify end-to-end workflows:

- User registration → login → browse properties → add favorite → send inquiry
- Agent registration → login → create property → update property → delete property
- Admin login → view all properties → update any property → view statistics

### Test Environment

**Test Database**:
- Use separate MongoDB database for testing (`rentease_test`)
- Clear database before each test
- Seed with test data as needed

**Test Configuration**:
```python
# conftest.py
import pytest
from app import create_app
from app.extensions import db

@pytest.fixture
def app():
    app = create_app()
    app.config['TESTING'] = True
    app.config['MONGODB_URI'] = 'mongodb://127.0.0.1:27017/rentease_test'
    yield app
    # Cleanup
    db.users.delete_many({})
    db.biz.delete_many({})

@pytest.fixture
def client(app):
    return app.test_client()
```

## Security Considerations

### Authentication Security

1. **Password Hashing**: All passwords hashed with bcrypt (salt rounds: 10)
2. **Password Truncation**: Passwords truncated to 72 bytes before hashing (bcrypt limitation)
3. **JWT Expiration**: Tokens expire after 24 hours
4. **Token Storage**: Frontend stores tokens in localStorage (consider httpOnly cookies for production)

### Authorization Security

1. **Role-Based Access Control**: Endpoints protected by role checks
2. **Ownership Verification**: Agents can only modify their own properties
3. **Admin Privileges**: Admin operations require admin role verification

### Input Security

1. **Input Validation**: All inputs validated before database operations
2. **Type Checking**: Ensure correct data types to prevent injection
3. **ObjectId Validation**: Validate ObjectId format to prevent errors
4. **SQL Injection Prevention**: MongoDB queries use parameterized queries (not string concatenation)

### CORS Security

1. **Allowed Origins**: CORS configured to allow localhost:4300 (development)
2. **Production Configuration**: Should restrict to specific production domains
3. **Credentials**: CORS should support credentials for JWT tokens

## Performance Considerations

### Database Optimization

1. **Indexes**: Create indexes on frequently queried fields:
   - `users.email` (unique index)
   - `biz.type` (for polymorphic queries)
   - `biz.agent_id` (for agent property queries)
   - `biz.user_id` (for user favorites/inquiries)

2. **Query Optimization**: Use projection to limit returned fields when full documents not needed

3. **Connection Pooling**: PyMongo handles connection pooling automatically

### Response Optimization

1. **ObjectId Conversion**: Convert ObjectId to string in responses for JSON serialization
2. **Pagination**: Consider adding pagination for large result sets (future enhancement)
3. **Caching**: Consider caching frequently accessed data (future enhancement)

## Deployment Considerations

### Environment Variables

Production deployment should use environment variables for sensitive configuration:

```python
# Environment variables to set
JWT_SECRET_KEY=<strong-random-secret>
MONGODB_URI=<production-mongodb-uri>
FLASK_ENV=production
CORS_ORIGINS=<production-frontend-url>
```

### Production Checklist

1. **Security**:
   - Change JWT secret key
   - Use strong MongoDB credentials
   - Enable MongoDB authentication
   - Configure CORS for production domain only
   - Use HTTPS for all communications

2. **Monitoring**:
   - Add logging for errors and important events
   - Monitor database performance
   - Track API response times

3. **Scalability**:
   - Consider using Gunicorn or uWSGI for production server
   - Configure appropriate worker processes
   - Set up load balancing if needed

4. **Database**:
   - Use MongoDB Atlas or managed MongoDB service
   - Configure backups
   - Set up monitoring and alerts

## Frontend Integration

### API Service Alignment

The Angular frontend's `api.service.ts` must align with backend responses:

**Expected Response Formats**:

```typescript
// Registration response
{
  msg: string;
  user_id: string;
  role: string;
}

// Login response
{
  msg: string;
  access_token: string;
  role: string;
}

// Property list response
Property[] // Array of property objects

// Property create response
{
  message: string;
  id: string;
}

// Favorite add response
{
  msg: string;
}

// Error response
{
  error: string; // or "Error"
}
```

### CORS Configuration

Backend CORS must allow:
- Origin: `http://localhost:4300` (development)
- Methods: GET, POST, PUT, DELETE, OPTIONS
- Headers: Content-Type, Authorization
- Credentials: true (for JWT tokens)

### Token Handling

1. Frontend stores JWT token in localStorage after login
2. Frontend includes token in Authorization header: `Bearer <token>`
3. Backend validates token on protected endpoints using `@jwt_required()`
4. Backend extracts user info from token using `get_jwt()`

## Migration Path

### Current State

The existing backend has:
- Basic blueprint structure ✓
- MongoDB connection ✓
- JWT authentication ✓
- CRUD operations for properties ✓
- User favorites and inquiries ✓
- Agent and admin routes ✓

### Required Enhancements

1. **Error Handling**: Add try-except blocks around all database operations
2. **Validation**: Add comprehensive input validation before database operations
3. **HTTP Status Codes**: Ensure correct status codes for all responses
4. **Response Consistency**: Standardize error response format (error vs Error key)
5. **CORS Configuration**: Verify CORS allows localhost:4300
6. **JWT Payload**: Ensure JWT includes identity, role, and user_id as strings
7. **Type Discriminators**: Verify all documents saved with correct "type" field
8. **Ownership Checks**: Ensure agent operations verify ownership

### Implementation Priority

1. **High Priority** (Core functionality):
   - Error handling for database operations
   - Input validation
   - HTTP status code corrections
   - JWT payload structure

2. **Medium Priority** (Robustness):
   - Response format consistency
   - Ownership verification
   - Type discriminator verification

3. **Low Priority** (Nice to have):
   - Database indexes
   - Logging
   - Performance optimization

## Conclusion

This design provides a comprehensive blueprint for optimizing the Rentease backend API. The implementation will focus on enhancing error handling, input validation, and ensuring consistency with the Angular frontend expectations while maintaining the existing modular blueprint architecture.

The property-based testing strategy will ensure correctness across a wide range of inputs, while unit tests will verify specific behaviors and edge cases. The result will be a production-ready backend API that is robust, secure, and well-tested.
