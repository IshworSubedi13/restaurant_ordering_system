from mongoengine import (
    Document, EmbeddedDocument, EmbeddedDocumentField,
    ReferenceField, ListField, IntField, StringField, FloatField, DateTimeField
)
import datetime
from backend.api.v1.models.user_model import User
from backend.api.v1.models.menu_model import Menu

class OrderItem(EmbeddedDocument):
    menu = ReferenceField(Menu, required=True)
    quantity = IntField(required=True, default=1)
    ordered_price = FloatField(required=True, default=0)

class Order(Document):
    user = ReferenceField(User, required=True)
    items = ListField(EmbeddedDocumentField(OrderItem), required=True)
    status = StringField(default="pending")  # pending, completed, canceled
    created_at = DateTimeField(default=lambda: datetime.datetime.now(datetime.timezone.utc))

def order_to_dict(order):
    return {
        "id": str(order.id),
        "user": {
            "id": str(order.user.id),
            "name": order.user.name,
            "email": order.user.email
        },
        "items": [
            {
                "menu_id": str(item.menu.id),
                "name": item.menu.name,
                "price": item.menu.price,
                "quantity": item.quantity,
                "ordered_price": item.ordered_price  # price paid per item
            } for item in order.items
        ],
        "total_price": sum(item.ordered_price * item.quantity for item in order.items),
        "status": order.status,
        "created_at": order.created_at.isoformat()
    }


def add_order(user, items_data):
    items = []
    for i in items_data:
        menu = Menu.objects(id=i["menu_id"]).first()
        if not menu:
            raise ValueError(f"Menu item {i['menu_id']} not found")
        price = menu.price  # capture current price
        items.append(OrderItem(menu=menu, quantity=i.get("quantity", 1), ordered_price=price))
    order = Order(user=user, items=items)
    order.save()
    return order


def list_all_orders():
    return Order.objects().order_by("-created_at")

def list_orders_by_user(user_id):
    return Order.objects(user=user_id).order_by("-created_at")

def find_order_by_id(order_id):
    return Order.objects(id=order_id).first()

def update_order(order_id, data):
    order = Order.objects(id=order_id).first()
    if not order:
        return None
    if "status" in data:
        order.status = data["status"]
    if "items" in data:
        items = []
        for i in data["items"]:
            menu = Menu.objects(id=i["menu_id"]).first()
            if not menu:
                raise ValueError(f"Menu item {i['menu_id']} not found")
            ordered_price = menu.price
            items.append(OrderItem(menu=menu, quantity=i.get("quantity", 1), ordered_price=ordered_price))
        order.items = items
    order.save()
    return order

def delete_order(order_id):
    order = Order.objects(id=order_id).first()
    if order:
        order.delete()
        return True
    return False
