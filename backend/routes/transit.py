from flask import Blueprint, current_app, jsonify
from services.mta_alerts_service import fetch_transit_status

transit_bp = Blueprint("transit", __name__)


@transit_bp.route("/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "ok",
        "service": "transit api"
    })


@transit_bp.route("/status", methods=["GET"])
def service_status():
    try:
        data = fetch_transit_status(
            current_app.config["MTA_SUBWAY_ALERTS_URL"],
            current_app.config["MTA_BUS_ALERTS_URL"],
            current_app.config["MTA_API_KEY"]
        )
        return jsonify(data)
    except Exception as e:
        return jsonify({
            "error": "Failed to fetch MTA transit status",
            "details": str(e)
        }), 500