# RentEase - Property Rental Backend

This is the backend API for the RentEase property rental application. Built with Flask and MongoDB.

## What it does

- User registration and login with JWT tokens
- Different user roles (admin, agent, customer)
- Property listings management
- User favorites and inquiries

## Tech used

- Flask (Python web framework)
- MongoDB (database)
- JWT for authentication
- bcrypt for password hashing

## Folder structure

```
Rentease/
 app/
    __init__.py      # creates the flask app
    extensions.py    # db and jwt setup
    admin/           # admin routes
    agent/           # agent routes
    auth/            # login/register
    properties/      # property crud
    user/            # user stuff
 run.py               # start the server
 requirements.txt     # python packages
```

## How to run

1. Make sure you have Python 3.8+ installed

2. Install the packages:
```bash
pip install -r requirements.txt
```

3. Make sure MongoDB is running on localhost:27017

4. Start the server:
```bash
python run.py
```

Server runs on http://127.0.0.1:5000

## API Routes

### Auth
- POST /auth/register - create account
- POST /auth/login - login and get token

### Properties
- GET /properties/ - get all properties
- GET /properties/<id> - get one property

### User (need to be logged in)
- POST /user/favorites - add to favorites
- GET /user/favorites - see favorites
- DELETE /user/favorites/<id> - remove favorite
- POST /user/inquiries - send inquiry
- GET /user/inquiries - see inquiries

### Agent (need agent role)
- GET /agent/properties - see my properties
- POST /agent/properties - add property
- PUT /agent/properties/<id> - update property
- DELETE /agent/properties/<id> - delete property

### Admin (need admin role)
- GET /admin/properties - see all properties
- DELETE /admin/properties/<id> - delete any property
- GET /admin/users - see all users
- PUT /admin/users/<id>/role - change user role
- GET /admin/statistics - get stats

## Database

Uses MongoDB with these collections:
- users - user accounts
- biz - properties and favorites
- blacklist - logged out tokens
