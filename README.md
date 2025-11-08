# Rentease - Property Rental Management System

A Flask-based REST API for managing property rentals, built with MongoDB and JWT authentication.

## Features

- User authentication (register/login)
- Role-based access control (Admin, Agent, User)
- Property management (CRUD operations)
- User favorites and inquiries
- Agent property listings

## Tech Stack

- **Backend:** Flask 
- **Database:** MongoDB
- **Authentication:** JWT 
- **Password Security:** bcrypt

## Project Structure

```
Rentease/
├── app/
│   ├── __init__.py          # App initialization
│   ├── extensions.py        # Database & JWT setup
│   ├── admin/              # Admin routes
│   ├── agent/              # Agent routes
│   ├── auth/               # Authentication routes
│   ├── properties/         # Property routes
│   └── user/               # User routes
├── run.py                   # Application entry point
└── requirements.txt         # Dependencies
```

## Setup Instructions

### Prerequisites
- Python 3.8+
- MongoDB (running on localhost:27017)

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd Rentease
```

2. Install dependencies
```bash
pip install -r requirements.txt
```

3. Start MongoDB
Make sure MongoDB is running on `mongodb://127.0.0.1:27017/`

4. Run the application
```bash
python run.py
```

The server will start on `http://127.0.0.1:5000`

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login

### Properties (Public)
- `GET /properties/` - List all properties
- `GET /properties/<id>` - Get property details

### User
- `POST /user/favorites` - Add property to favorites
- `GET /user/favorites` - Get user favorites
- `DELETE /user/favorites/<id>` - Remove from favorites
- `POST /user/inquiries` - Send inquiry
- `GET /user/inquiries` - Get user inquiries

### Agent
- `GET /agent/properties` - Get agent's properties
- `POST /agent/properties` - Add new property
- `PUT /agent/properties/<id>` - Update property
- `DELETE /agent/properties/<id>` - Delete property

### Admin
- `GET /admin/properties` - Get all properties
- `DELETE /admin/properties/<id>` - Delete any property
- `GET /admin/users` - Get all users
- `PUT /admin/users/<id>/role` - Update user role
- `GET /admin/statistics` - Get system statistics

## Database Collections

- **users** - User accounts
- **biz** - Properties, favorites, and inquiries
- **blacklist** - Revoked JWT tokens

## Authentication

All protected routes require JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Configuration

- JWT Secret Key: Set in `extensions.py` (use environment variable in production)
- Token Expiration: 24 hours
- MongoDB Database: `rentease`


