from flask import Flask
from backend.api.extensions import init_db, jwt
from backend.api.config import Config
from backend.api.v1.routes import register_blueprints
from mongoengine import get_connection,connect
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app)
    init_db(app)
    jwt.init_app(app)

    # connect(db="restaurant_db", host="mongodb+srv://ishworsubedi13:eyofkhzbh@cluster1.uohuvtf.mongodb.net/restaurant_db")
    # conn = get_connection()
    # print(conn.list_database_names())

    register_blueprints(app)
    return app

if __name__ == "__main__":
    create_app().run(debug=True)

