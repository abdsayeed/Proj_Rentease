# Requirements Document

## Introduction

This specification defines the requirements for optimizing the Rentease Flask backend API. The backend currently has basic functionality implemented but requires enhancements for production readiness, including comprehensive error handling, input validation, proper HTTP status codes, and alignment with the Angular frontend expectations.

## Glossary

- **Backend**: The Flask-based REST API server that handles all business logic and database operations
- **Frontend**: The Angular 20 standalone application that consumes the Backend APIs
- **MongoDB**: The NoSQL database storing users, properties, favorites, and inquiries in collections
- **JWT**: JSON Web Token used for stateless authentication
- **Polymorphic Collection**: The `biz` collection that stores multiple document types (property, favorite, inquiry) distinguished by a `type` field
- **Agent**: A user role that can create and manage property listings
- **Admin**: A user role with full system access including user management
- **User**: A standard user role that can browse properties, save favorites, and send inquiries

## Requirements

### Requirement 1

**User Story:** As a developer, I want the Flask application to use the Application Factory pattern, so that the application is properly initialized with all extensions and blueprints.

#### Acceptance Criteria

1. WHEN the application starts THEN the system SHALL initialize Flask using the create_app factory function
2. WHEN blueprints are registered THEN the system SHALL use the correct URL prefixes for each module (auth, properties, user, agent, admin)
3. WHEN CORS is configured THEN the system SHALL allow requests from localhost:4300
4. WHEN extensions are initialized THEN the system SHALL properly configure PyMongo and JWT managers

### Requirement 2

**User Story:** As a developer, I want proper database connection handling, so that the application gracefully handles MongoDB connection failures.

#### Acceptance Criteria

1. WHEN MongoDB connection is established THEN the system SHALL verify connectivity using a ping command
2. WHEN MongoDB connection fails THEN the system SHALL log the error and raise an exception
3. WHEN collections are initialized THEN the system SHALL create users, biz, and blacklist collections if they do not exist
4. WHEN database operations are performed THEN the system SHALL use try-except blocks to handle MongoDB errors

### Requirement 3

**User Story:** As a user, I want to register and login securely, so that my credentials are protected.

#### Acceptance Criteria

1. WHEN a user registers THEN the system SHALL hash the password using bcrypt before storing
2. WHEN a user registers with an existing email THEN the system SHALL return HTTP 409 Conflict
3. WHEN a user logs in with valid credentials THEN the system SHALL generate a JWT token with identity, role, and user_id as strings
4. WHEN a user logs in with invalid credentials THEN the system SHALL return HTTP 401 Unauthorized
5. WHEN required fields are missing THEN the system SHALL return HTTP 400 Bad Request with a descriptive error message

### Requirement 4

**User Story:** As a user, I want to browse and search properties, so that I can find rentals that match my criteria.

#### Acceptance Criteria

1. WHEN properties are listed THEN the system SHALL return all documents with type "property"
2. WHEN filters are applied THEN the system SHALL support district, property_type, price_min, and price_max query parameters
3. WHEN a single property is requested THEN the system SHALL return the property details or HTTP 404 if not found
4. WHEN an invalid property ID is provided THEN the system SHALL return HTTP 400 Bad Request
5. WHEN ObjectId conversion fails THEN the system SHALL handle the exception and return an appropriate error

### Requirement 5

**User Story:** As an agent, I want to create and manage properties, so that I can list rentals on the platform.

#### Acceptance Criteria

1. WHEN an agent creates a property THEN the system SHALL verify the user has agent or admin role
2. WHEN a property is created THEN the system SHALL save it with type "property" and include the agent_id
3. WHEN a non-agent attempts to create a property THEN the system SHALL return HTTP 403 Forbidden
4. WHEN an agent updates a property THEN the system SHALL verify ownership before allowing the update
5. WHEN an agent deletes a property THEN the system SHALL verify ownership before allowing the deletion
6. WHEN required fields are missing THEN the system SHALL return HTTP 400 Bad Request

### Requirement 6

**User Story:** As a user, I want to save favorite properties and send inquiries, so that I can track properties I'm interested in.

#### Acceptance Criteria

1. WHEN a favorite is added THEN the system SHALL save it with type "favorite" and include user_id and property_id
2. WHEN a duplicate favorite is added THEN the system SHALL return a message indicating it already exists
3. WHEN favorites are listed THEN the system SHALL return only the current user's favorites
4. WHEN an inquiry is sent THEN the system SHALL save it with type "inquiry" and include user_id, property_id, and message
5. WHEN required fields are missing THEN the system SHALL return HTTP 400 Bad Request

### Requirement 7

**User Story:** As an admin, I want to manage all properties and users, so that I can maintain the platform.

#### Acceptance Criteria

1. WHEN an admin views all properties THEN the system SHALL return all property documents regardless of owner
2. WHEN an admin updates any property THEN the system SHALL allow the update without ownership verification
3. WHEN an admin deletes any property THEN the system SHALL allow the deletion without ownership verification
4. WHEN a non-admin attempts admin operations THEN the system SHALL return HTTP 403 Forbidden
5. WHEN an admin views statistics THEN the system SHALL return counts of users, properties, favorites, and inquiries

### Requirement 8

**User Story:** As a developer, I want consistent error handling across all endpoints, so that the frontend can properly handle errors.

#### Acceptance Criteria

1. WHEN a database error occurs THEN the system SHALL return HTTP 500 with an error message
2. WHEN validation fails THEN the system SHALL return HTTP 400 with a descriptive error message
3. WHEN a resource is not found THEN the system SHALL return HTTP 404 with an error message
4. WHEN authorization fails THEN the system SHALL return HTTP 403 with an error message
5. WHEN authentication fails THEN the system SHALL return HTTP 401 with an error message
6. WHEN an error response is returned THEN the system SHALL use consistent JSON structure with an "error" or "Error" key

### Requirement 9

**User Story:** As a developer, I want proper input validation on all endpoints, so that invalid data is rejected before database operations.

#### Acceptance Criteria

1. WHEN email is provided THEN the system SHALL validate it is not empty
2. WHEN password is provided THEN the system SHALL validate it is not empty and truncate to 72 bytes for bcrypt
3. WHEN price is provided THEN the system SHALL validate it is a valid integer
4. WHEN ObjectId is provided THEN the system SHALL validate it can be converted to ObjectId format
5. WHEN required fields are missing THEN the system SHALL return HTTP 400 before attempting database operations
