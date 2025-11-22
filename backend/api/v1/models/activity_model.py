from mongoengine import Document, StringField, DateTimeField
import datetime


class Activity(Document):
    icon = StringField(required=True)
    description = StringField(required=True)
    created_at = DateTimeField(default=lambda: datetime.datetime.now(tz=datetime.timezone.utc))


def log_activity(icon, description):
    activity = Activity(
        icon=icon,
        description=description
    )
    activity.save()
    return activity


def get_recent_activities(limit=20):
    return Activity.objects.order_by("-created_at").limit(limit)


def activity_to_dict(activity):
    return {
        "id": str(activity.id),
        "icon": activity.icon,
        "description": activity.description,
        "created_at": activity.created_at.isoformat() if activity.created_at else None
    }
