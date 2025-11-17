from .auth_routes import auth_bp
from .user_routes import user_bp


def register_blueprints(app):
    app.register_blueprint(auth_bp, url_prefix="/api/v1/auth")
    app.register_blueprint(user_bp, url_prefix="/api/v1/users")
