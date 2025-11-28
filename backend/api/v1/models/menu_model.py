from mongoengine import Document, StringField, FloatField, BooleanField, DateTimeField, ReferenceField
import datetime
from backend.api.v1.models.category_model import Category


class Menu(Document):
    name = StringField(required=True)
    price = FloatField(required=True)
    category = ReferenceField(Category, required=True)
    image = StringField()
    available = BooleanField(default=True)
    created_at = DateTimeField(default=lambda: datetime.datetime.now(datetime.timezone.utc))


def menu_to_dict(menu):
    try:
        category = menu.category
    except Exception:
        category = None

    return {
        "id": str(menu.id),
        "name": menu.name,
        "price": menu.price,
        "image": menu.image,
        "available": menu.available,
        "category": {
            "id": str(category.id) if category else None,
            "name": category.name if category else "Unknown",
            "description": category.description if category else "Category was deleted"
        }
    }

def list_all_menu():
    return Menu.objects()

def find_menu_by_id(menu_id):
    return Menu.objects.get(id=menu_id)

def add_menu(data):
    category_id = data.get("category_id")
    category = Category.objects(id=category_id).first()
    if not category:
        raise ValueError("Category not found")

    menu = Menu(
        name=data["name"],
        price=float(data["price"]),
        category=category,
        image=data.get("image"),
        available=data.get("available", True)
    )
    menu.save()
    return menu

def update_menu(menu_id, data):
    menu = find_menu_by_id(menu_id)

    if "name" in data:
        menu.name = data["name"]

    if "price" in data:
        menu.price = float(data["price"])

    if "available" in data:
        menu.available = data["available"]

    if "image" in data:
        menu.image = data["image"]

    if "category_id" in data:
        category = Category.objects(id=data["category_id"]).first()
        if not category:
            raise ValueError("Category not found")
        menu.category = category

    menu.save()
    return menu


def delete_menu(menu_id):
    menu = find_menu_by_id(menu_id)
    menu.delete()
    return True
