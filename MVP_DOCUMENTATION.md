# Rentease - Full Project MVP Documentation

##  Project Overview

**Rentease** is a full-stack property rental management system with role-based access control. Users can browse properties, manage favorites, send inquiries, agents can list properties, and admins manage the platform.

### Key Features
-  User authentication (Register/Login) with JWT
-  Role-based access (User/Agent/Admin)
-  Property browsing with filters
-  Favorites management
-  Inquiry system
-  Agent property management
-  Admin dashboard
-  Responsive design
-  Real-time updates

---

##  Architecture Overview

### Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Angular 20, TypeScript, RxJS, Bootstrap 5 |
| **Backend** | Flask, Python 3.8+, PyJWT, bcrypt |
| **Database** | MongoDB (rentease database) |
| **Authentication** | JWT (24-hour expiration) |
| **API Communication** | REST API with CORS |

### System Architecture

\\\

                    CLIENT BROWSERS                           

  Angular Frontend     Port: 4300 (localhost:4300)          
  (Standalone)         - Home/Login/Register                
                       - Properties Management              
                       - User Dashboard                     

                HTTP/REST

  Flask Backend        Port: 5000 (127.0.0.1:5000)         
  (REST API)           - Auth Routes                        
                       - Properties Routes                  
                       - User Routes                        
                       - Agent Routes                       
                       - Admin Routes                       

                PyMongo Driver

  MongoDB              localhost:27017                      
  (rentease DB)        Collections:                         
                       - users (User accounts)              
                       - biz (Properties/Favorites/Inquiries)
                       - blacklist (JWT tokens)             

\\\

---

##  Project Structure

### Backend Structure
\\\
Rentease/
 app/
    __init__.py              # Flask app factory & blueprint registration
    extensions.py            # MongoDB & JWT initialization
    run.py                   # Application entry point
    requirements.txt         # Python dependencies
   
    auth/
       routes.py            # Authentication routes
           POST /auth/register
           POST /auth/login
   
    properties/
       routes.py            # Public property routes
           GET /properties/
           GET /properties/<id>
           POST /properties/
           PUT /properties/<id>
           DELETE /properties/<id>
   
    user/
       routes.py            # User personal routes (requires auth)
           POST /favorites
           GET /favorites
           DELETE /favorites/<id>
           POST /inquiries
           GET /inquiries
   
    agent/
       routes.py            # Agent-specific routes (requires auth + agent role)
           POST /agent/properties
           GET /agent/properties
           PUT /agent/properties/<id>
           DELETE /agent/properties/<id>
   
    admin/
        routes.py            # Admin routes (requires admin role)
            GET /admin/properties
            PUT /admin/properties/<id>
            DELETE /admin/properties/<id>
            GET /admin/users
            PUT /admin/users/<id>/role
            DELETE /admin/users/<id>

 README.md                    # Backend documentation
\\\

### Frontend Structure
\\\
front_end/
 src/
    main.ts                  # Application bootstrap
    index.html               # HTML entry point
    styles.css               # Global styles
   
    app/
        app.ts               # Root component
        app.routes.ts        # Route definitions with guards
        app.config.ts        # Angular configuration & interceptors
       
        core/                # Core module (never lazy-loaded)
           services/
              auth.service.ts      # Authentication & token management
              api.service.ts       # All API endpoints (typed)
           guards/
              auth.guard.ts        # Route protection (authGuard, agentGuard, adminGuard)
           interceptors/
              token.interceptor.ts # Automatic JWT injection
           models/
              index.ts             # TypeScript interfaces
           index.ts                 # Barrel exports
       
        features/            # Feature modules
           auth/
              login/
                 login.component.ts
              register/
                  register.component.ts
           properties/
              home/
                 home.component.ts
              [Other components to be built]
           dashboard/
           favorites/
           [Other features]
       
        shared/              # Reusable code
           components/
           utils/
           models/
       
        layouts/
           navbar/
       
        environments/
            environment.ts
            environment.prod.ts

 angular.json                 # Angular CLI config
 tsconfig.json               # TypeScript config
 package.json                # Node dependencies
 README.md                   # Frontend documentation
\\\

---

##  Authentication & Authorization

### Authentication Flow

\\\
User Input (Email/Password)
        

   Frontend: RegisterComponent/LoginComponent
   - Validates input
   - Calls AuthService.register/login()

                

   AuthService (Frontend)
   - Makes HTTP POST request
   - Stores token & user in localStorage
   - Returns Observable

                

   Backend: /auth/register or /auth/login
   - Validates credentials
   - Hashes password with bcrypt
   - Creates JWT token
   - Returns {token, role, user_id}

                

   TokenInterceptor (Frontend)
   - Intercepts all HTTP requests
   - Adds "Authorization: Bearer <token>"
   - Sends to backend

\\\

### JWT Token Structure

\\\json
{
  "Header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "Payload": {
    "identity": "user_id_from_mongodb",
    "role": "user|agent|admin",
    "user_id": "user_id_from_mongodb",
    "exp": "24 hours from creation"
  },
  "Signature": "HMAC-SHA256(secret_key)"
}
\\\

### Role-Based Access Control (RBAC)

\\\
Dashboard (authGuard)         Any authenticated user
Add Property (agentGuard)     Only agents & admins
Admin Panel (adminGuard)      Only admins
\\\

---

##  API Endpoints

### 1. Authentication Routes
\\\
POST /auth/register
 Body: { email, password, role: 'user'|'agent' }
 Returns: { msg, user_id, role }
 Status: 201 Created / 400 Bad Request / 409 Conflict

POST /auth/login
 Body: { email, password }
 Returns: { msg, access_token, role }
 Status: 200 OK / 401 Unauthorized
\\\

### 2. Properties Routes (Public)
\\\
GET /api/v1/properties/
 Query: ?location=&type=&price_min=&price_max=
 Returns: [{ _id, title, price, location, agent_id... }]
 Status: 200 OK

GET /api/v1/properties/<id>
 Returns: { _id, title, description, price, location, agent_id... }
 Status: 200 OK / 404 Not Found

POST /api/v1/properties/
 Auth: Required
 Body: { title, price, location, type, description... }
 Returns: { msg, id }
 Status: 201 Created

PUT /api/v1/properties/<id>
 Auth: Required
 Body: { title?, price?, location?, available?... }
 Returns: { msg }
 Status: 200 OK / 404 Not Found
\\\

### 3. User Routes (Protected)
\\\
POST /api/v1/users/favorites
 Auth: Required
 Body: { property_id }
 Returns: { msg }
 Status: 201 Created

GET /api/v1/users/favorites
 Auth: Required
 Returns: [{ _id, property_id, createdAt }]
 Status: 200 OK

DELETE /api/v1/users/favorites/<property_id>
 Auth: Required
 Returns: { msg }
 Status: 200 OK

POST /api/v1/users/inquiries
 Auth: Required
 Body: { property_id, message }
 Returns: { msg, inquiry_id }
 Status: 201 Created

GET /api/v1/users/inquiries
 Auth: Required
 Returns: [{ _id, property_id, message, status, createdAt }]
 Status: 200 OK
\\\

### 4. Agent Routes (Protected - Agent Role Required)
\\\
POST /api/v1/agent/properties
 Auth: Required + Agent Role
 Body: { title, price, location, type, bedrooms, bathrooms... }
 Returns: { msg, id }
 Status: 201 Created

GET /api/v1/agent/properties
 Auth: Required + Agent Role
 Returns: [{ _id, title, price, location, agent_id... }]
 Status: 200 OK

PUT /api/v1/agent/properties/<id>
 Auth: Required + Agent Role
 Body: { title?, price?, location?... }
 Returns: { msg }
 Status: 200 OK / 404 Not Found

DELETE /api/v1/agent/properties/<id>
 Auth: Required + Agent Role
 Returns: { msg }
 Status: 200 OK / 404 Not Found
\\\

### 5. Admin Routes (Protected - Admin Role Required)
\\\
GET /api/v1/admin/properties
 Auth: Required + Admin Role
 Returns: [{ all properties }]
 Status: 200 OK

PUT /api/v1/admin/properties/<id>
 Auth: Required + Admin Role
 Body: { any fields }
 Returns: { msg }
 Status: 200 OK

DELETE /api/v1/admin/properties/<id>
 Auth: Required + Admin Role
 Returns: { msg }
 Status: 200 OK

GET /api/v1/admin/users
 Auth: Required + Admin Role
 Returns: [{ _id, email, role, createdAt }]
 Status: 200 OK

PUT /api/v1/admin/users/<id>/role
 Auth: Required + Admin Role
 Body: { role: 'user'|'agent'|'admin' }
 Returns: { msg }
 Status: 200 OK
\\\

---

##  Database Schema

### MongoDB Collections

#### \users\ Collection
\\\json
{
  "_id": ObjectId,
  "email": "user@example.com",
  "password_hash": "bcrypt_hash",
  "role": "user|agent|admin",
  "createdAt": ISODate
}
\\\

#### \iz\ Collection (Polymorphic)
\\\json
// Property Document
{
  "_id": ObjectId,
  "type": "property",
  "title": "Luxury Apartment",
  "description": "Beautiful 2-bedroom...",
  "price": 5000,
  "location": "Mayfair, London",
  "property_type": "apartment|house|flat|studio|penthouse",
  "bedrooms": 2,
  "bathrooms": 1,
  "area": 1200,
  "amenities": ["WiFi", "Gym", "Pool"],
  "images": ["url1", "url2"],
  "agent_id": ObjectId,
  "available": true,
  "createdAt": ISODate,
  "updatedAt": ISODate
}

// Favorite Document
{
  "_id": ObjectId,
  "type": "favorite",
  "user_id": ObjectId,
  "property_id": ObjectId,
  "createdAt": ISODate
}

// Inquiry Document
{
  "_id": ObjectId,
  "type": "inquiry",
  "user_id": ObjectId,
  "property_id": ObjectId,
  "agent_id": ObjectId,
  "message": "I'm interested in this property...",
  "status": "pending|responded|closed",
  "createdAt": ISODate
}
\\\

#### \lacklist\ Collection
\\\json
{
  "_id": ObjectId,
  "jti": "token_id",
  "createdAt": ISODate,
  "expiredAt": ISODate
}
\\\

---

##  Core Services

### Backend Services

#### 1. AuthService (routes.py)
**Purpose:** User registration and authentication

\\\python
# Register new user
POST /auth/register
- Validates email & password
- Hashes password with bcrypt
- Creates user document in MongoDB
- Returns user_id and role

# Login user
POST /auth/login
- Validates credentials
- Checks password hash
- Creates JWT token with 24-hour expiration
- Returns token and role
\\\

#### 2. PropertiesService (routes.py)
**Purpose:** Property CRUD operations (Public)

\\\python
# List all properties
GET /api/v1/properties/
- Optional filters: location, type, price_min, price_max
- Returns paginated list of properties

# Get single property
GET /api/v1/properties/<id>
- Returns property details

# Create property (All authenticated users)
POST /api/v1/properties/
- Creates new property document

# Update property (Owner or Admin)
PUT /api/v1/properties/<id>
- Updates property fields

# Delete property (Owner or Admin)
DELETE /api/v1/properties/<id>
- Removes property document
\\\

#### 3. UserService (routes.py)
**Purpose:** User personal data (Favorites, Inquiries)

\\\python
# Favorites Management
POST /api/v1/users/favorites      # Add to favorites
GET /api/v1/users/favorites       # Get saved properties
DELETE /api/v1/users/favorites/<id> # Remove from favorites

# Inquiries Management
POST /api/v1/users/inquiries      # Send property inquiry
GET /api/v1/users/inquiries       # Get user's inquiries
\\\

#### 4. AgentService (routes.py)
**Purpose:** Agent-only property management

\\\python
# Requires: Agent or Admin role
POST /api/v1/agent/properties     # Create property
GET /api/v1/agent/properties      # Get own properties
PUT /api/v1/agent/properties/<id> # Update own property
DELETE /api/v1/agent/properties/<id> # Delete own property
\\\

#### 5. AdminService (routes.py)
**Purpose:** Admin panel operations

\\\python
# Requires: Admin role
GET /api/v1/admin/properties      # View all properties
PUT /api/v1/admin/properties/<id> # Update any property
DELETE /api/v1/admin/properties/<id> # Delete any property
GET /api/v1/admin/users           # List all users
PUT /api/v1/admin/users/<id>/role # Change user role
DELETE /api/v1/admin/users/<id>   # Delete user
\\\

### Frontend Services

#### 1. AuthService
**Purpose:** Authentication and token management

\\\	ypescript
// Methods
register(data: RegisterRequest): Observable<LoginResponse>
login(data: LoginRequest): Observable<LoginResponse>
logout(): void
getCurrentUser(): User | null
getToken(): string | null
isAuthenticated(): boolean
getUserRole(): string | null
hasRole(role: string): boolean

// Storage
- Token stored in localStorage (key: 'token')
- User stored in localStorage (key: 'user')
\\\

#### 2. ApiService
**Purpose:** All HTTP API calls with proper typing

\\\	ypescript
// Properties
getProperties(filters?): Observable<any>
getProperty(id): Observable<Property>
createProperty(data): Observable<Property>
updateProperty(id, data): Observable<Property>
deleteProperty(id): Observable<any>
getMyProperties(): Observable<Property[]>

// Favorites
getFavorites(): Observable<Favorite[]>
addFavorite(propertyId): Observable<Favorite>
removeFavorite(propertyId): Observable<any>

// Inquiries
sendInquiry(data): Observable<Inquiry>
getInquiries(): Observable<Inquiry[]>
getSentInquiries(): Observable<Inquiry[]>
updateInquiry(id, status): Observable<Inquiry>

// User Profile
getProfile(): Observable<User>
updateProfile(data): Observable<User>

// Admin
getStatistics(): Observable<any>
getAllUsers(): Observable<any>
updateUserRole(userId, role): Observable<User>
\\\

---

##  Route Guards

### Frontend Route Protection

\\\	ypescript
// authGuard
- Checks if user is authenticated
- Redirects to /login if not
- Usage: canActivate: [authGuard]

// agentGuard
- Checks authentication AND agent role
- Redirects to / if not authorized
- Usage: canActivate: [agentGuard]

// adminGuard
- Checks authentication AND admin role
- Redirects to / if not authorized
- Usage: canActivate: [adminGuard]
\\\

### Protected Routes

\\\	ypescript
/properties          (Public - everyone can see)
/login               (Public - redirects if already logged in)
/register            (Public - redirects if already logged in)
/dashboard           (authGuard - authenticated users only)
/favorites           (authGuard - authenticated users only)
/add-property        (agentGuard - agents & admins only)
/admin               (adminGuard - admins only)
\\\

---

##  Frontend Components

### Implemented Components

#### 1. HomeComponent (\/properties\)
- Displays welcome message
- Shows system status
- Links to Login/Register
- Responsive design

#### 2. LoginComponent (\/login\)
- Email and password input
- Form validation
- Error handling
- Redirects to /properties on success

#### 3. RegisterComponent (\/register\)
- Email and password input
- Role selection (User/Agent)
- Password confirmation
- Form validation
- Redirects to /properties on success

### Components to Build

\\\
Features to implement:
- Property listing with filters
- Property details view
- Favorites page
- Inquiries page
- Dashboard (User/Agent/Admin specific)
- Add/Edit property form
- User profile
- Admin panel
- Navbar with navigation
- Footer
- Responsive components
\\\

---

##  Data Flow Examples

### User Registration Flow

\\\
1. User fills registration form
   
2. Frontend: RegisterComponent validates input
   
3. Calls AuthService.register(email, password, role)
   
4. HTTP POST to /auth/register
   
5. Backend: Validates, hashes password, creates user
   
6. Returns: { user_id, role, message }
   
7. Frontend: Stores nothing yet (user logs in next)
   
8. Redirects to /login
\\\

### User Login Flow

\\\
1. User enters email/password
   
2. Frontend: LoginComponent validates
   
3. Calls AuthService.login(email, password)
   
4. HTTP POST to /auth/login
   
5. Backend: Validates credentials, creates JWT token
   
6. Returns: { access_token, role, message }
   
7. Frontend: Stores token & user in localStorage
   
8. TokenInterceptor adds token to all future requests
   
9. Redirects to /properties
\\\

### Property Listing Flow

\\\
1. User navigates to /properties
   
2. HomeComponent loads
   
3. Calls ApiService.getProperties()
   
4. HTTP GET to /api/v1/properties/
   
5. Backend: Queries MongoDB for properties
   
6. Returns: [{ _id, title, price, location... }]
   
7. Frontend: Displays properties in component
   
8. User can click on property to see details
\\\

### Add to Favorites Flow

\\\
1. User clicks "Add to Favorites" on property
   
2. FavoritesComponent calls ApiService.addFavorite(propertyId)
   
3. HTTP POST to /api/v1/users/favorites
    Header: Authorization: Bearer <token>
    Body: { property_id: "..." }
   
4. Backend: Validates token, creates favorite document
   
5. Returns: { msg, id }
   
6. Frontend: Shows success message
   
7. User can see property in /favorites page
\\\

---

##  How to Run

### Backend Setup

\\\ash
# 1. Navigate to project root
cd c:\Users\shahe\Desktop\FS\ project\Rentease

# 2. Install dependencies
pip install -r requirements.txt

# 3. Ensure MongoDB is running
# (Should be running on mongodb://127.0.0.1:27017/)

# 4. Start Flask server
python run.py

# Backend runs on: http://127.0.0.1:5000
\\\

### Frontend Setup

\\\ash
# 1. Navigate to frontend directory
cd front_end

# 2. Install dependencies
npm install

# 3. Start Angular dev server
npm start

# Frontend runs on: http://localhost:4300
\\\

### Testing the Application

\\\
1. Open http://localhost:4300 in browser
2. Click "Register" and create new account (choose User or Agent)
3. Login with credentials
4. Browse properties on home page
5. Click property to see details
6. Add property to favorites
7. Send inquiry message
8. View your inquiries
9. If Agent: Add new properties from dashboard
10. If Admin: Manage users and properties
\\\

---

##  Security Features

### Authentication
-  JWT tokens with 24-hour expiration
-  Bcrypt password hashing (salt rounds: 10)
-  Token stored securely in localStorage
-  Token automatically included in API requests

### Authorization
-  Role-based access control (User/Agent/Admin)
-  Route guards prevent unauthorized access
-  Backend validates role for protected endpoints
-  Admin-only operations protected

### Data Protection
-  CORS enabled for frontend
-  Password never sent in plain text
-  All API responses validated
-  Input validation on frontend and backend

---

##  Current Status

###  Completed
- Backend API structure (5 route modules)
- MongoDB database setup
- JWT authentication
- Role-based authorization
- Frontend architecture (professional structure)
- Core services (Auth & API)
- Route guards
- Basic components (Home, Login, Register)
- TypeScript models and interfaces
- Environment configuration

###  In Progress
- Frontend component implementation
- Properties listing and filtering
- Property details view
- Favorites management
- Inquiries system
- Dashboard implementation
- Admin panel

###  TODO
- User profile page
- Property search/advanced filters
- Image upload for properties
- Notifications system
- Review/rating system
- Pagination
- Testing (unit & e2e)
- Production deployment
- Documentation

---

##  Key Files Reference

### Backend
| File | Purpose |
|------|---------|
| \pp/__init__.py\ | App factory & blueprint registration |
| \pp/extensions.py\ | MongoDB & JWT setup |
| \pp/auth/routes.py\ | Authentication endpoints |
| \pp/properties/routes.py\ | Property CRUD operations |
| \pp/user/routes.py\ | User favorites & inquiries |
| \pp/agent/routes.py\ | Agent property management |
| \pp/admin/routes.py\ | Admin operations |
| \un.py\ | Application entry point |

### Frontend
| File | Purpose |
|------|---------|
| \src/app/app.ts\ | Root component |
| \src/app/app.routes.ts\ | Route definitions with guards |
| \src/app/app.config.ts\ | Angular config & interceptors |
| \src/app/core/services/auth.service.ts\ | Authentication service |
| \src/app/core/services/api.service.ts\ | API service |
| \src/app/core/guards/auth.guard.ts\ | Route guards |
| \src/app/core/interceptors/token.interceptor.ts\ | JWT injection |
| \src/app/features/auth/login/login.component.ts\ | Login component |
| \src/app/features/auth/register/register.component.ts\ | Register component |
| \src/app/features/properties/home/home.component.ts\ | Home component |

---

##  Architecture Highlights

### Frontend Architecture (bizReview Aligned)
- **Pragmatic Design:** No over-engineering, clean code
- **Modular Structure:** Core/Features/Shared/Layouts
- **Type Safety:** Strict TypeScript throughout
- **Lean Services:** Simplified auth & API (61% code reduction)
- **Route Guards:** Built-in authorization
- **Token Interceptor:** Automatic JWT injection
- **Barrel Exports:** Clean import paths

### Backend Architecture
- **Blueprint Pattern:** Modular route organization
- **Separation of Concerns:** Auth/Properties/User/Agent/Admin
- **JWT Integration:** Secure token-based auth
- **Role-Based Access:** User/Agent/Admin roles
- **Error Handling:** Consistent error responses
- **Database Abstraction:** PyMongo integration

---

##  Support & Debugging

### Common Issues

**Frontend shows blank page:**
- Check if backend is running on port 5000
- Verify environment.ts has correct API URL
- Check browser console for errors

**Login/Register not working:**
- Ensure MongoDB is running
- Check backend logs for errors
- Verify email/password are correct format

**Token not persisting:**
- Check localStorage in browser DevTools
- Verify TokenInterceptor is registered in app.config.ts
- Check Network tab in DevTools for Authorization header

**CORS errors:**
- Backend has CORS enabled, should work out of box
- If issues persist, check Flask CORS configuration

---

##  Next Steps

1. **Build remaining components**
   - Property listing with filters
   - Property details view
   - Dashboard pages

2. **Add features**
   - Image upload
   - Search functionality
   - Pagination
   - User profiles

3. **Enhance UI/UX**
   - Add more styling
   - Responsive design improvements
   - Loading states & animations
   - Error messages

4. **Testing**
   - Unit tests for services
   - E2E tests for user flows
   - API integration testing

5. **Deployment**
   - Production environment config
   - Docker containerization
   - Database backups
   - Error monitoring

---

##  Version Info

- **Frontend:** Angular 20.1.0, TypeScript 5.2.2
- **Backend:** Flask 2.3.3, Python 3.8+
- **Database:** MongoDB (latest)
- **Status:** MVP Phase - Core features working
- **Last Updated:** December 3, 2025

---

##  License & Credits

**Project:** Rentease - Property Rental Management System
**Owner:** abdsayeed
**Repository:** https://github.com/abdsayeed/Proj_Rentease
**Branch:** main
