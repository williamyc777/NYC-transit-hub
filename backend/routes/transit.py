from flask import Blueprint, jsonify, current_app
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
        print("DEBUG subway url:", current_app.config["MTA_SUBWAY_ALERTS_URL"])
        print("DEBUG bus url:", current_app.config["MTA_BUS_ALERTS_URL"])

        data = fetch_transit_status(
            current_app.config["MTA_SUBWAY_ALERTS_URL"],
            current_app.config["MTA_BUS_ALERTS_URL"]
        )
        return jsonify(data)
    except Exception as e:
        return jsonify({
            "error": "Failed to fetch MTA transit status",
            "details": str(e)
        }), 500

@transit_bp.route("/api/transit/status", methods=["GET"])
def get_transit_status():
    return jsonify(fetch_transit_status(
        current_app.config["MTA_SUBWAY_ALERTS_URL"],
        current_app.config["MTA_BUS_ALERTS_URL"]
    ))        