from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from backend.api.v1.models.menu_model import (
    list_all_menu,
    find_menu_by_id,
    add_menu,
    update_menu,
    delete_menu,
    menu_to_dict
)
from backend.api.v1.models.category_model import Category

menu_bp = Blueprint("menu_bp", __name__, url_prefix="/menus")


@menu_bp.get("/")
@jwt_required()
def get_all_menu_route():
    claims = get_jwt()
    if claims.get("role") != "admin":
        return jsonify({"error": "Admin access required"}), 403
    menus = list_all_menu()
    return jsonify([menu_to_dict(m) for m in menus]), 200


@menu_bp.get("/<menu_id>")
@jwt_required()
def get_menu_by_id_route(menu_id):
    claims = get_jwt()
    if claims.get("role") != "admin":
        return jsonify({"error": "Admin access required"}), 403
    try:
        menu = find_menu_by_id(menu_id)
        return jsonify(menu_to_dict(menu)), 200
    except:
        return jsonify({"error": "Menu item not found"}), 404


@menu_bp.post("/")
@jwt_required()
def create_menu_route():
    claims = get_jwt()
    if claims.get("role") != "admin":
        return jsonify({"error": "Admin access required"}), 403
    data = request.get_json()
    try:
        menu = add_menu(data)
        return jsonify(menu_to_dict(menu)), 201
    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@menu_bp.put("/<menu_id>")
@jwt_required()
def update_menu_route(menu_id):
    claims = get_jwt()
    if claims.get("role") != "admin":
        return jsonify({"error": "Admin access required"}), 403
    data = request.get_json()
    try:
        updated_menu = update_menu(menu_id, data)
        return jsonify(menu_to_dict(updated_menu)), 200
    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 404


@menu_bp.delete("/<menu_id>")
@jwt_required()
def delete_menu_route(menu_id):
    claims = get_jwt()
    if claims.get("role") != "admin":
        return jsonify({"error": "Admin access required"}), 403
    try:
        delete_menu(menu_id)
        return jsonify({"message": "Menu item deleted"}), 200
    except:
        return jsonify({"error": "Menu item not found"}), 404


@menu_bp.get("/category/<string:category_name>")
@jwt_required()
def get_menus_by_category_route(category_name):
    token_claims = get_jwt()
    if token_claims.get("role") != "admin":
        return jsonify({"error": "Admin access required"}), 403
    category = Category.objects(name=category_name).first()
    if not category:
        return jsonify({"error": "Category not found"}), 404
    menus = list_all_menu()
    filtered = [menu_to_dict(m) for m in menus if m.category == category]
    return jsonify(filtered), 200
