"""
Test configuration and fixtures for Rentease backend tests.
"""
import pytest
from app import create_app
import app.extensions as ext


@pytest.fixture
def app():
    """
    Create and configure a Flask application instance for testing.
    
    Yields:
        Flask: Configured test application
    """
    app = create_app()
    app.config['TESTING'] = True
    
    yield app
    
    # Cleanup: Clear test database collections
    if ext.db is not None:
        ext.db["users"].delete_many({})
        ext.db["biz"].delete_many({})
        ext.db["blacklist"].delete_many({})


@pytest.fixture
def client(app):
    """
    Create a test client for the Flask application.
    
    Args:
        app: Flask application fixture
        
    Returns:
        FlaskClient: Test client for making requests
    """
    return app.test_client()


@pytest.fixture
def runner(app):
    """
    Create a test CLI runner for the Flask application.
    
    Args:
        app: Flask application fixture
        
    Returns:
        FlaskCliRunner: Test CLI runner
    """
    return app.test_cli_runner()


@pytest.fixture
def db():
    """
    Provide access to the test database.
    
    Returns:
        Database: MongoDB database instance
    """
    return ext.db
