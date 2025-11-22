from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from backend.api.v1.models.user_model import (
    list_all_users,
    find_user_by_id,
    user_to_dict
)

user_bp = Blueprint("user_bp", __name__)

@user_bp.get("/")
@jwt_required()
def get_all_users_route():
    claims = get_jwt()
    if claims.get("role") != "admin":
        return jsonify({"error": "Admin access required"}), 403

    users = list_all_users()
    return jsonify([user_to_dict(u) for u in users]), 200


@user_bp.get("/<user_id>")
@jwt_required()
def get_user_by_id_route(user_id):
    claims = get_jwt()
    if claims.get("role") != "admin":
        return jsonify({"error": "Admin access required"}), 403

    user = find_user_by_id(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify(user_to_dict(user)), 200

@user_bp.get("/count")
@jwt_required()
def get_customer_count():
    claims = get_jwt()
    if claims.get("role") != "admin":
        return jsonify({"error": "Admin access required"}), 403

    total_customers = sum(1 for u in list_all_users() if u.role == "user")
    return jsonify({"total_customers": total_customers}), 200
