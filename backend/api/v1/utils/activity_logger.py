from datetime import datetime, timezone
from bson import ObjectId

def log_activity(db, icon, description):
    activity = {
        "_id": ObjectId(),
        "icon": icon,
        "description": description,
        "created_at": datetime.now(tz=timezone.utc)
    }

    db.activity_logs.insert_one(activity)
