from mongoengine import Document, StringField, EmailField, DateTimeField
from werkzeug.security import generate_password_hash, check_password_hash
import datetime

class User(Document):
    name = StringField(required=True)
    email = EmailField(required=True, unique=True)
    password = StringField(required=True)
    role = StringField(required=True, choices=["user", "admin"])
    created_at = DateTimeField(default=lambda: datetime.datetime.now(tz=datetime.timezone.utc))


def list_all_users():
    return User.objects()


def find_user_by_id(user_id):
    return User.objects.get(id=user_id)


def find_user_by_email(email):
    return User.objects(email=email).first()


def add_user(data):
    hashed_pw = generate_password_hash(data.get('password'), method="pbkdf2:sha256")

    new_user = User(
        name=data.get('name'),
        email=data.get('email'),
        password=hashed_pw,
        role=data.get('role', 'user'),  # default role 'user'
    )
    new_user.save()
    return new_user


def check_user_password(user, password):
    return check_password_hash(user.password, password)


def user_to_dict(user):
    return {
        "id": str(user.id),
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "created_at": user.created_at.isoformat() if user.created_at else None
    }
