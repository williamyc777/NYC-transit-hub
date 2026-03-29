from flask import Blueprint, jsonify

transit_bp = Blueprint("transit", __name__)


@transit_bp.route("/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "ok",
        "service": "transit api"
    })


@transit_bp.route("/status", methods=["GET"])
def service_status():
    return jsonify({
        "subway": [
            {"line": "A", "status": "Good Service"},
            {"line": "1", "status": "Delay"}
        ],
        "bus": [
            {"route": "M15", "status": "Good Service"}
        ]
    })