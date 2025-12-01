from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt

from backend.api.v1.models.activity_model import log_activity
from backend.api.v1.models.category_model import (
    list_all_categories,
    find_category_by_id,
    add_category,
    update_category,
    delete_category,
    category_to_dict, find_category_by_name
)

category_bp = Blueprint("category_bp", __name__, url_prefix="/categories")


@category_bp.get("/")
@jwt_required()
def get_all_categories_route():
    claims = get_jwt()
    if claims.get("role") != "admin":
        return jsonify({"error": "Admin access required"}), 403
    categories = list_all_categories()
    return jsonify([category_to_dict(c) for c in categories]), 200

# @category_bp.get("/all")
# @jwt_required()
# def get_all_categories():
#     claims = get_jwt()
#     if claims.get("role") != "user":
#         return jsonify({"error": "User access required"}), 403
#     categories = list_all_categories()
#     return jsonify([category_to_dict(c) for c in categories]), 200

@category_bp.get("/all")
def get_all_categories():
    categories = list_all_categories()
    return jsonify([category_to_dict(c) for c in categories]), 200


@category_bp.get("/<category_id>")
@jwt_required()
def get_category_by_id_route(category_id):
    claims = get_jwt()
    if claims.get("role") != "admin":
        return jsonify({"error": "Admin access required"}), 403
    try:
        category = find_category_by_id(category_id)
    except:
        return jsonify({"error": "Category not found"}), 404
    return jsonify(category_to_dict(category)), 200


@category_bp.post("/")
@jwt_required()
def create_category_route():
    claims = get_jwt()
    if claims.get("role") != "admin":
        return jsonify({"error": "Admin access required"}), 403
    data = request.get_json()
    try:
        category = add_category(data)
        log_activity("category", f"Category added: {category.name}")
        return jsonify(category_to_dict(category)), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@category_bp.put("/<category_id>")
@jwt_required()
def update_category_route(category_id):
    claims = get_jwt()
    if claims.get("role") != "admin":
        return jsonify({"error": "Admin access required"}), 403
    data = request.get_json()
    try:
        updated = update_category(category_id, data)
        log_activity("category", f"Category updated: {updated.name}")
        return jsonify(category_to_dict(updated)), 200
    except:
        return jsonify({"error": "Category not found"}), 404


@category_bp.delete("/<category_id>")
@jwt_required()
def delete_category_route(category_id):
    claims = get_jwt()
    if claims.get("role") != "admin":
        return jsonify({"error": "Admin access required"}), 403
    try:
        category = find_category_by_id(category_id)
        if not category:
            return jsonify({"error": "Category not found"}), 404
        delete_category(category_id)
        log_activity("category", f"Category deleted: {category.name}")
        return jsonify({"message": "Category deleted"}), 200
    except:
        return jsonify({"error": "Category not found"}), 404


@category_bp.get("/name/<string:name>")
@jwt_required()
def get_category_by_name_route(name):
    claims = get_jwt()
    if claims.get("role") != "admin":
        return jsonify({"error": "Admin access required"}), 403
    category = find_category_by_name(name)
    if category is None:
        return jsonify({"error": "Category not found"}), 404
    return jsonify(category_to_dict(category)), 200



