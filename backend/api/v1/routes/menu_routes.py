import os

from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt
from werkzeug.utils import secure_filename

from backend.api.v1.models.activity_model import log_activity
from backend.api.v1.models.menu_model import (
    list_all_menu, add_menu,
    update_menu, delete_menu, menu_to_dict, get_todays_specials_menu
)

menu_bp = Blueprint("menu_bp", __name__, url_prefix="/menus")

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}
def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def save_image(file):
    if not file or not allowed_file(file.filename):
        return None

    filename = secure_filename(file.filename)

    upload_folder = os.path.join(current_app.static_folder, "uploads", "menus")
    os.makedirs(upload_folder, exist_ok=True)

    filepath = os.path.join(upload_folder, filename)
    file.save(filepath)

    return f"/static/uploads/menus/{filename}"


@menu_bp.get("/")
@jwt_required()
def get_all_menu_route():
    if get_jwt().get("role") != "admin":
        return jsonify({"error": "Admin access required"}), 403

    menus = list_all_menu()
    return jsonify([menu_to_dict(m) for m in menus]), 200

# @menu_bp.get("/all")
# @jwt_required()
# def get_all_menu_route():
#     if get_jwt().get("role") != "user":
#         return jsonify({"error": "Admin access required"}), 403

#     menus = list_all_menu()
#     return jsonify([menu_to_dict(m) for m in menus]), 200

@menu_bp.get("/all")
def get_all_menu():
    menus = list_all_menu()
    return jsonify([menu_to_dict(m) for m in menus]), 200


@menu_bp.post("/")
@jwt_required()
def create_menu_route():
    if get_jwt().get("role") != "admin":
        return jsonify({"error": "Admin access required"}), 403

    data = request.form.to_dict()
    file = request.files.get("image")

    image_url = save_image(file)
    if image_url:
        data["image"] = image_url
    data["available"] = data.get("available") == "true"
    data["is_special"] = data.get("is_special") == "true"

    try:
        menu = add_menu(data)
        log_activity("menu_book", f"Menu added: {menu.name}")
        return jsonify(menu_to_dict(menu)), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 400


@menu_bp.put("/<menu_id>")
@jwt_required()
def update_menu_route(menu_id):
    if get_jwt().get("role") != "admin":
        return jsonify({"error": "Admin access required"}), 403

    data = request.form.to_dict()
    file = request.files.get("image")

    image_url = save_image(file)
    if image_url:
        data["image"] = image_url

    if "available" in data:
        data["available"] = data["available"] == "true"
    if "is_special" in data:
        data["is_special"] = data["is_special"] == "true"

    try:
        menu = update_menu(menu_id, data)
        log_activity("menu_book", f"Menu updated: {menu.name}")
        return jsonify(menu_to_dict(menu)), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 400


@menu_bp.delete("/<menu_id>")
@jwt_required()
def delete_menu_route(menu_id):
    if get_jwt().get("role") != "admin":
        return jsonify({"error": "Admin access required"}), 403
    try:
        delete_menu(menu_id)
        log_activity("menu_book", f"Menu deleted: {menu_id}")
        return jsonify({"message": "Menu deleted"}), 200
    except:
        return jsonify({"error": "Menu not found"}), 404


@menu_bp.get("/specials")
def get_todays_specials():
    try:
        specials = get_todays_specials_menu()

        if not specials:
            from backend.api.v1.models.menu_model import Menu
            specials = Menu.objects(available=True).limit(7)

        return jsonify({
            "success": True,
            "title": "Today's Specials",
            "message": "Check out our exclusive deals for today!",
            "count": len(specials),
            "specials": [menu_to_dict(s) for s in specials]
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "specials": []
        }), 500
