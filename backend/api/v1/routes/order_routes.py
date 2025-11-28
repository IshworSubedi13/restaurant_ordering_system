from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from backend.api.v1.models.order_model import (
    add_order,
    list_all_orders,
    list_orders_by_user,
    find_order_by_id,
    update_order,
    delete_order,
    order_to_dict
)
from backend.api.v1.models.user_model import User

order_bp = Blueprint("order_bp", __name__)


@order_bp.post("/")
@jwt_required()
def create_order_route():
    user_id = get_jwt_identity()
    claims = get_jwt()
    role = claims.get("role", "user")
    if role not in ["user", "admin"]:
        return jsonify({"error": "Forbidden"}), 403
    data = request.get_json()
    items = data.get("items", [])
    if not items:
        return jsonify({"error": "No items provided"}), 400
    user = User.objects(id=user_id).first()
    if not user:
        return jsonify({"error": "User not found"}), 404
    try:
        order = add_order(user, items)
        return jsonify(order_to_dict(order)), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@order_bp.get("/")
@jwt_required()
def get_orders_route():
    user_id = get_jwt_identity()
    claims = get_jwt()
    role = claims.get("role", "user")
    if role == "admin":
        orders = list_all_orders()
    else:
        orders = list_orders_by_user(user_id)
    return jsonify([order_to_dict(o) for o in orders]), 200


@order_bp.get("/<order_id>")
@jwt_required()
def get_order_by_id_route(order_id):
    user_id = get_jwt_identity()
    claims = get_jwt()
    role = claims.get("role", "user")
    order = find_order_by_id(order_id)
    if not order:
        return jsonify({"error": "Order not found"}), 404
    if role != "admin" and str(order.user.id) != str(user_id):
        return jsonify({"error": "Forbidden"}), 403
    return jsonify(order_to_dict(order)), 200


@order_bp.put("/<order_id>")
@jwt_required()
def update_order_route(order_id):
    claims = get_jwt()
    role = claims.get("role", "user")
    if role != "admin":
        return jsonify({"error": "Admin access required"}), 403
    data = request.get_json()
    order = update_order(order_id, data)
    if not order:
        return jsonify({"error": "Order not found"}), 404
    return jsonify(order_to_dict(order)), 200


@order_bp.delete("/<order_id>")
@jwt_required()
def delete_order_route(order_id):
    claims = get_jwt()
    role = claims.get("role", "user")
    if role != "admin":
        return jsonify({"error": "Admin access required"}), 403
    success = delete_order(order_id)
    if not success:
        return jsonify({"error": "Order not found"}), 404
    return jsonify({"message": "Order deleted"}), 200


@order_bp.get("/total_orders")
@jwt_required()
def total_orders():
    claims = get_jwt()
    role = claims.get("role", "user")

    if role != "admin":
        return jsonify({"error": "Admin access required"}), 403
    orders = list_all_orders()
    return jsonify({"total_orders": orders.count()}), 200


@order_bp.get("/total_revenue")
@jwt_required()
def total_revenue():
    claims = get_jwt()
    role = claims.get("role", "user")
    if role != "admin":
        return jsonify({"error": "Admin access required"}), 403
    orders = list_all_orders()
    revenue = sum(
        sum(item.ordered_price * item.quantity for item in order.items)
        for order in orders
    )
    return jsonify({"total_revenue": revenue}), 200