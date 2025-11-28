from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token

from backend.api.v1.models.activity_model import log_activity
from backend.api.v1.models.user_model import (
    add_user,
    find_user_by_email,
    check_user_password,
    user_to_dict
)

auth_bp = Blueprint("auth_bp", __name__)


@auth_bp.post("/register")
def register():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid JSON"}), 400

    if find_user_by_email(data.get("email")):
        return jsonify({"error": "Email already exists"}), 409

    user = add_user({
        "name": data.get("name"),
        "email": data.get("email"),
        "password": data.get("password"),
        "role": data.get("role", "user")
    })
    log_activity("person_add", f"New user registered: {user.name}")
    return jsonify({"message": "User created", "user_id": str(user.id)}), 201


@auth_bp.post("/login")
def login():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid JSON"}), 400

    user = find_user_by_email(data.get("email"))
    if not user or not check_user_password(user, data.get("password")):
        return jsonify({"error": "Invalid credentials"}), 401

    token = create_access_token(
        identity=str(user.id),
        additional_claims={"role": user.role, "user_id": str(user.id)}
    )

    return jsonify({"access_token": token, "user": user_to_dict(user)}), 200
