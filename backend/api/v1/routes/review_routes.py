from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt

from backend.api.v1.models.activity_model import log_activity
from backend.api.v1.models.review_model import (
    add_review, list_all_reviews,
    find_review_by_id, update_review as update_review_model,
    delete_review as delete_review_model, review_to_dict
)
from backend.api.v1.models.user_model import User
from backend.api.v1.models.menu_model import Menu

review_bp = Blueprint("review_bp", __name__)

@review_bp.post("/")
@jwt_required()
def create_review():
    user_id = get_jwt_identity()
    data = request.get_json() or {}
    comment = data.get("comment")
    rating = data.get("rating")
    menu_id = data.get("menu_id")

    if not all([comment, rating]):
        return jsonify({"error": "Missing required fields: comment, rating"}), 400

    user = User.objects(id=user_id).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    menu = None
    if menu_id:
        menu = Menu.objects(id=menu_id).first()
        if not menu:
            return jsonify({"error": "Menu item not found"}), 404

    review = add_review(user=user, comment=comment, rating=rating, menu=menu)
    log_activity("comment", f"User {user.username} created a review {review.id}")
    return jsonify(review_to_dict(review)), 201


@review_bp.get("/")
def get_reviews():
    reviews = list_all_reviews()
    return jsonify([review_to_dict(r) for r in reviews]), 200


@review_bp.get("/<review_id>")
@jwt_required()
def get_review_by_id(review_id):
    review = find_review_by_id(review_id)
    if not review:
        return jsonify({"error": "Review not found"}), 404
    return jsonify(review_to_dict(review)), 200


@review_bp.put("/<review_id>")
@jwt_required()
def update_review(review_id):
    user_id = get_jwt_identity()
    review = find_review_by_id(review_id)
    if not review:
        return jsonify({"error": "Review not found"}), 404

    if str(review.user.id) != str(user_id):
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json() or {}
    updated_review = update_review_model(review_id, data)
    log_activity("comment", f"User {review.user.username} updated review {review.id}")
    return jsonify(review_to_dict(updated_review)), 200


@review_bp.delete("/<review_id>")
@jwt_required()
def delete_review(review_id):
    user_id = get_jwt_identity()
    claims = get_jwt()
    role = claims.get("role", "user")

    review = find_review_by_id(review_id)
    if not review:
        return jsonify({"error": "Review not found"}), 404

    if role != "admin" and str(review.user.id) != str(user_id):
        return jsonify({"error": "Unauthorized"}), 403

    delete_review_model(review_id)
    log_activity("review", f"User {user_id if role != 'admin' else 'admin'} deleted review {review.id}")
    return jsonify({"message": "Review deleted successfully"}), 200
