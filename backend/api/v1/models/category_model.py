from mongoengine import Document, StringField, DateTimeField
import datetime


class Category(Document):
    name = StringField(required=True, unique=True)
    description = StringField()
    created_at = DateTimeField(default=lambda: datetime.datetime.now(tz=datetime.timezone.utc))


def list_all_categories():
    return Category.objects()


def find_category_by_id(category_id):
    return Category.objects.get(id=category_id)


def find_category_by_name(name):
    return Category.objects(name=name).first()


def add_category(data):
    new_category = Category(
        name=data.get("name"),
        description=data.get("description", "")
    )
    new_category.save()
    return new_category


def update_category(category_id, data):
    category = find_category_by_id(category_id)

    if "name" in data:
        category.name = data["name"]

    if "description" in data:
        category.description = data["description"]

    category.save()
    return category


def delete_category(category_id):
    category = find_category_by_id(category_id)
    category.delete()
    return True


def category_to_dict(category):
    return {
        "id": str(category.id),
        "name": category.name,
        "description": category.description,
        "created_at": category.created_at.isoformat() if category.created_at else None
    }
