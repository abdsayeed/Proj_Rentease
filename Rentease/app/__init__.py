# Main app factory - creates and configures Flask app
from flask import Flask, jsonify
from .extensions import init_extensions
from .properties.routes import properties_app
from .auth.routes import auth_app
from .agent.routes import agent_app
from .admin.routes import admin_app
from .user.routes import user_app

def create_app():
    app = Flask(__name__)
    app.url_map.strict_slashes = False  # prevents redirect issues with CORS
    
    init_extensions(app)
    
    # register all blueprints with their url prefixes
    app.register_blueprint(properties_app, url_prefix="/api/v1/properties")
    app.register_blueprint(auth_app, url_prefix="/auth")
    app.register_blueprint(agent_app, url_prefix="/api/v1/agent")
    app.register_blueprint(admin_app, url_prefix="/api/v1/admin")
    app.register_blueprint(user_app, url_prefix="/api/v1/users")

    @app.route("/")
    def index():
        return jsonify({"msg": "RentEase API running"}), 200

    return app
