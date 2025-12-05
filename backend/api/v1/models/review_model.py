from mongoengine import Document, ReferenceField, IntField, StringField, DateTimeField
import datetime
from backend.api.v1.models.user_model import User
from backend.api.v1.models.menu_model import Menu

class Review(Document):
    user = ReferenceField(User, required=True)
    menu = ReferenceField(Menu, required=False)
    comment = StringField(required=True)
    rating = IntField(required=True, min_value=1, max_value=5)
    created_at = DateTimeField(default=lambda: datetime.datetime.now(datetime.timezone.utc))

def review_to_dict(review):
    return {
        "id": str(review.id),
        "user": {
            "id": str(review.user.id),
            "name": review.user.name,
            "email": review.user.email
        },
        "menu": {
            "id": str(review.menu.id),
            "name": review.menu.name
        } if review.menu else None,
        "comment": review.comment,
        "rating": review.rating,
        "created_at": review.created_at.isoformat()
    }

def add_review(user, comment, rating, menu=None):
    review = Review(user=user, comment=comment, rating=rating, menu=menu)
    review.save()
    return review

def list_all_reviews():
    return Review.objects().order_by("-created_at")

def list_reviews_by_user(user_id):
    return Review.objects(user=user_id).order_by("-created_at")

def find_review_by_id(review_id):
    return Review.objects(id=review_id).first()

def update_review(review_id, data):
    review = Review.objects(id=review_id).first()
    if not review:
        return None
    if "comment" in data:
        review.comment = data["comment"]
    if "rating" in data:
        review.rating = data["rating"]
    if "menu_id" in data:
        from backend.api.v1.models.menu_model import Menu
        menu = Menu.objects(id=data["menu_id"]).first()
        review.menu = menu
    review.save()
    return review

def delete_review(review_id):
    review = Review.objects(id=review_id).first()
    if review:
        review.delete()
        return True
    return False
