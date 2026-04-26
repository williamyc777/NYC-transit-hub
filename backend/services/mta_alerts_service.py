import time
import requests
from google.transit import gtfs_realtime_pb2


SUBWAY_DEFAULTS = [
    "1", "2", "3", "4", "5", "6", "7",
    "A", "B", "C", "D", "E", "F", "G",
    "J", "L", "M", "N", "Q", "R", "S", "W", "Z"
]


def _first_translation(translated_string):
    if not translated_string or not translated_string.translation:
        return ""
    return translated_string.translation[0].text.strip()


def _is_alert_active(alert, now_ts):
    if not alert.active_period:
        return True

    for period in alert.active_period:
        start = period.start if period.HasField("start") else None
        end = period.end if period.HasField("end") else None

        if start is not None and now_ts < start:
            continue
        if end is not None and now_ts > end:
            continue
        return True

    return False


def _load_feed(url, api_key=None):
    headers = {"x-api-key": api_key} if api_key else None
    resp = requests.get(url, headers=headers, timeout=20)
    resp.raise_for_status()

    feed = gtfs_realtime_pb2.FeedMessage()
    feed.ParseFromString(resp.content)
    return feed


def fetch_subway_alerts(url, api_key=None):
    if not url:
        raise ValueError("MTA_SUBWAY_ALERTS_URL is not configured")

    feed = _load_feed(url, api_key)
    now_ts = int(time.time())
    subway_map = {}

    for entity in feed.entity:
        if not entity.HasField("alert"):
            continue

        alert = entity.alert
        if not _is_alert_active(alert, now_ts):
            continue

        title = _first_translation(alert.header_text) or "Service Alert"
        description = _first_translation(alert.description_text)

        for informed in alert.informed_entity:
            route_id = informed.route_id.strip() if informed.route_id else ""
            if not route_id:
                continue

            if route_id not in subway_map:
                subway_map[route_id] = {
                    "route": route_id,
                    "status": "ALERT",
                    "message": title,
                    "details": description,
                }

    result = []
    for route in SUBWAY_DEFAULTS:
        result.append(
            subway_map.get(route, {
                "route": route,
                "status": "OK",
                "message": "No Active Alerts",
                "details": "",
            })
        )

    return result


def fetch_bus_alerts(url, api_key=None):
    if not url:
        raise ValueError("MTA_BUS_ALERTS_URL is not configured")

    feed = _load_feed(url, api_key)
    now_ts = int(time.time())
    bus_map = {}

    for entity in feed.entity:
        if not entity.HasField("alert"):
            continue

        alert = entity.alert
        if not _is_alert_active(alert, now_ts):
            continue

        title = _first_translation(alert.header_text) or "Service Alert"
        description = _first_translation(alert.description_text)

        for informed in alert.informed_entity:
            route_id = informed.route_id.strip() if informed.route_id else ""
            if not route_id:
                continue

            if route_id not in bus_map:
                bus_map[route_id] = {
                    "route": route_id,
                    "status": "ALERT",
                    "message": title,
                    "details": description,
                }

    COMMON_BUS_ROUTES = [
        "M15", "M14", "M7", "M5", "M101",
        "B44", "B41", "B62",
        "Q44", "Q58", "Q60",
        "BX12", "BX6",
    ]

    result = []

    for route in COMMON_BUS_ROUTES:
        result.append(
            bus_map.get(route, {
                "route": route,
                "status": "OK",
                "message": "No Active Alerts",
                "details": "",
            })
        )

    for route, data in bus_map.items():
        if route not in COMMON_BUS_ROUTES:
            result.append(data)

    result.sort(key=lambda x: (x["status"] != "ALERT", x["route"]))
    return result


def fetch_transit_status(subway_url, bus_url, api_key=None):
    subway = fetch_subway_alerts(subway_url, api_key)
    bus = fetch_bus_alerts(bus_url, api_key)

    summary = {
        "subway_total": len(subway),
        "subway_alerts": sum(1 for item in subway if item.get("status") == "ALERT"),
        "bus_total": len(bus),
        "bus_alerts": sum(1 for item in bus if item.get("status") == "ALERT"),
    }

    return {
        "subway": subway,
        "bus": bus,
        "summary": summary,
        "meta": {
            "source": "MTA GTFS-RT Alerts",
            "generated_at": int(time.time()),
        },
    }