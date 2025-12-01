from flask import Flask, render_template, redirect, url_for
from backend.api.extensions import init_db, jwt
from backend.api.config import Config
from backend.api.v1.routes import register_blueprints

from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    init_db(app)
    jwt.init_app(app)

    register_blueprints(app)

    CORS(
        app,
        resources={r"/api/*": {"origins": [
            "http://127.0.0.1:5500",
            "http://localhost:5500",
        ]}},
        supports_credentials=True,
    )
    

    @app.route("/")
    def home():
        return "Welcome to the Restaurant Management System API"

    @app.route("/register")
    def user_register():
        return render_template("pages/register.html")

    @app.route("/admin/login")
    def admin_login():
        return render_template("pages/admin_login.html")

    @app.route("/admin-dashboard")
    def admin_dashboard():
        return render_template("index.html")

    @app.route("/admin/<page>")
    def admin_page(page):
        try:
            return render_template(f"pages/{page}.html")
        except:
            return "Page not found", 404

    @app.route("/logout")
    def logout():
        return redirect(url_for("admin_login"))

    return app

if __name__ == "__main__":
    create_app().run(debug=True)

