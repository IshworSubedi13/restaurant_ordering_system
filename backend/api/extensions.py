from flask_jwt_extended import JWTManager
from mongoengine import connect, get_connection

jwt = JWTManager()

def init_db(app):
    connect(
        db="restaurant_db",
        host=app.config["MONGO_URI"]
    )
    try:
        get_connection().admin.command("ping")
        print("MongoDB database connected successfully")
    except Exception as e:
        print("MongoDB database connection failed:", e)
