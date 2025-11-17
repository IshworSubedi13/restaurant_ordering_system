from flask import Flask

from backend.api.config import Config
from backend.api.extensions import init_db, jwt

def create_app():
    app = Flask(__name__)

    app.config.from_object(Config)

    init_db(app)
    jwt.init_app(app)

    from backend.api.v1.routes.user_routes import user_bp

    app.register_blueprint(user_bp, url_prefix="/api/v1/users")

    return app
