from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from backend.api.v1.models.activity_model import (
    get_recent_activities,
    activity_to_dict
)

activity_bp = Blueprint("activity_bp", __name__)


@activity_bp.get("/recent")
@jwt_required()
def recent_activity():
    try:
        activities = get_recent_activities()
        return jsonify({
            "activities": [activity_to_dict(a) for a in activities]
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
