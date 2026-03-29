from flask import Blueprint, jsonify
from services.mta_service import get_service_status

transit_bp = Blueprint("transit", __name__)


@transit_bp.route("/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "ok",
        "service": "transit api"
    })


@transit_bp.route("/status", methods=["GET"])
def service_status():
    data = get_service_status()
    return jsonify(data)