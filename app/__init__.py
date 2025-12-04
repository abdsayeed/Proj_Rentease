from flask import Flask, jsonify
from flask_cors import CORS
from .extensions import init_extensions
from .properties.routes import properties_app
from .auth.routes import auth_app
from .agent.routes import agent_app
from .admin.routes import admin_app
from .user.routes import user_app


def create_app():
    """
    Creates and configures the Flask application using the Application Factory pattern.
    
    Returns:
        Flask: Configured Flask application instance with all blueprints registered
    """
    app = Flask(__name__)
    
    # Configure CORS to allow requests from Angular frontend (localhost:4200)
    CORS(app, origins=["http://localhost:4200", "http://localhost:4300"], supports_credentials=True)
    
    # Initialize extensions (MongoDB, JWT)
    init_extensions(app)
    
    # Register blueprints with appropriate URL prefixes
    app.register_blueprint(properties_app, url_prefix="/api/v1/properties")
    app.register_blueprint(auth_app, url_prefix="/auth")
    app.register_blueprint(agent_app, url_prefix="/api/v1/agent")
    app.register_blueprint(admin_app, url_prefix="/api/v1/admin")
    app.register_blueprint(user_app, url_prefix="/api/v1/users")

    # Health check endpoint
    @app.route("/")
    def index():
        return jsonify({"msg": "RentEase API running"}), 200

    return app
