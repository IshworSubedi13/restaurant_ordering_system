from .auth_routes import auth_bp
from .category_routes import category_bp
from .menu_routes import menu_bp
from .order_routes import order_bp
from .user_routes import user_bp
from .activity_routes import activity_bp


def register_blueprints(app):
    app.register_blueprint(auth_bp, url_prefix="/api/v1/auth")
    app.register_blueprint(user_bp, url_prefix="/api/v1/users")
    app.register_blueprint(activity_bp, url_prefix="/api/v1/activities")
    app.register_blueprint(category_bp, url_prefix="/api/v1/categories")
    app.register_blueprint(menu_bp, url_prefix="/api/v1/menus")
    app.register_blueprint(order_bp, url_prefix="/api/v1/orders")

