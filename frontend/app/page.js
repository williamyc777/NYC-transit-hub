"use client";

import { useEffect, useState } from "react";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:5000"
).replace(/\/$/, "");

function getLineColor(route) {
  const map = {
    "1": "#EE352E",
    "2": "#EE352E",
    "3": "#EE352E",
    "4": "#00933C",
    "5": "#00933C",
    "6": "#00933C",
    "7": "#B933AD",
    "A": "#0039A6",
    "C": "#0039A6",
    "E": "#0039A6",
    "B": "#FF6319",
    "D": "#FF6319",
    "F": "#FF6319",
    "M": "#FF6319",
    "G": "#6CBE45",
    "J": "#996633",
    "Z": "#996633",
    "L": "#A7A9AC",
    "N": "#FCCC0A",
    "Q": "#FCCC0A",
    "R": "#FCCC0A",
    "W": "#FCCC0A",
    "S": "#808183",
  };

  return map[route] || "#111827";
}

function StatusBadge({ status }) {
  const isAlert = status === "ALERT";

  return (
    <span
      style={{
        display: "inline-block",
        padding: "4px 10px",
        borderRadius: "999px",
        fontSize: "12px",
        fontWeight: 700,
        backgroundColor: isAlert ? "#fee2e2" : "#dcfce7",
        color: isAlert ? "#b91c1c" : "#15803d",
      }}
    >
      {status}
    </span>
  );
}

function RoutePill({ route, type }) {
  const backgroundColor = type === "subway" ? getLineColor(route) : "#111827";
  const textColor =
    route === "N" || route === "Q" || route === "R" || route === "W"
      ? "#111827"
      : "#ffffff";

  return (
    <div
      style={{
        minWidth: "42px",
        height: "42px",
        borderRadius: "999px",
        backgroundColor,
        color: textColor,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 800,
        fontSize: "18px",
        flexShrink: 0,
      }}
    >
      {route}
    </div>
  );
}

function StatusCard({ item, type }) {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "18px",
        padding: "18px",
        marginBottom: "14px",
        boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "14px",
          marginBottom: "12px",
        }}
      >
        <RoutePill route={item.route} type={type} />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: "16px" }}>
            {type === "subway" ? `Line ${item.route}` : `Route ${item.route}`}
          </div>
        </div>
        <StatusBadge status={item.status} />
      </div>

      <div style={{ fontWeight: 600, fontSize: "15px", marginBottom: "8px" }}>
        {item.message}
      </div>

      {item.details && (
        <div
          style={{
            color: "#4b5563",
            lineHeight: 1.6,
            whiteSpace: "pre-wrap",
            fontSize: "14px",
          }}
        >
          {item.details}
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value }) {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "18px",
        padding: "18px",
        boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
      }}
    >
      <div
        style={{
          fontSize: "13px",
          color: "#6b7280",
          marginBottom: "8px",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: "26px",
          fontWeight: 800,
          color: "#111827",
        }}
      >
        {value}
      </div>
    </div>
  );
}
function FavoriteButton({ active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        border: "none",
        background: "transparent",
        cursor: "pointer",
        fontSize: "20px",
        lineHeight: 1,
        padding: 0,
      }}
      aria-label={active ? "Remove favorite" : "Add favorite"}
      title={active ? "Remove favorite" : "Add favorite"}
    >
      {active ? "★" : "☆"}
    </button>
  );
}

export default function HomePage() {
  const [data, setData] = useState({
    subway: [],
    bus: [],
    meta: null,
    summary: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAllBus, setShowAllBus] = useState(false);
  const [showSubwayOk, setShowSubwayOk] = useState(false);
  const [showBusOk, setShowBusOk] = useState(false);
  const [query, setQuery] = useState("");
  const [favorites, setFavorites] = useState([]);

  const BUS_INITIAL_COUNT = 10;

  useEffect(() => {
    const savedFavorites = localStorage.getItem("transit-favorites");
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch {
        setFavorites([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("transit-favorites", JSON.stringify(favorites));
  }, [favorites]);

  function toggleFavorite(type, route) {
    const key = `${type}:${route}`;

    setFavorites((prev) =>
      prev.includes(key)
        ? prev.filter((item) => item !== key)
        : [...prev, key]
    );
  }

  function isFavorite(type, route) {
    return favorites.includes(`${type}:${route}`);
  }

  function filterByQuery(list) {
    if (!query.trim()) return list;

    const q = query.toLowerCase();

    return list.filter((item) =>
      `${item.route} ${item.message || ""} ${item.details || ""}`
        .toLowerCase()
        .includes(q)
    );
  }

  function sortFavoritesFirst(list, type) {
    return [...list].sort((a, b) => {
      const aFav = isFavorite(type, a.route) ? 1 : 0;
      const bFav = isFavorite(type, b.route) ? 1 : 0;

      if (aFav !== bFav) return bFav - aFav;

      return String(a.route).localeCompare(String(b.route), undefined, {
        numeric: true,
      });
    });
  }

  useEffect(() => {
    async function fetchTransitStatus() {
      try {
        setError("");

        const res = await fetch(`${API_BASE_URL}/api/transit/status`);

        if (!res.ok) {
          let details = "";
          try {
            const errorJson = await res.json();
            details = errorJson.details || errorJson.error || "";
          } catch {
            details = "";
          }

          throw new Error(
            details
              ? `Transit API returned HTTP ${res.status}: ${details}`
              : `Transit API returned HTTP ${res.status}`
          );
        }

        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err.message || "Failed to fetch transit status");
      } finally {
        setLoading(false);
      }
    }

    fetchTransitStatus();

    const intervalId = setInterval(fetchTransitStatus, 60000);

    return () => clearInterval(intervalId);
  }, []);

  const subwayAlertsList = sortFavoritesFirst(
    filterByQuery(data.subway.filter((item) => item.status === "ALERT")),
    "subway"
  );

  const subwayOkList = sortFavoritesFirst(
    filterByQuery(data.subway.filter((item) => item.status !== "ALERT")),
    "subway"
  );

  const busAlertsList = sortFavoritesFirst(
    filterByQuery(data.bus.filter((item) => item.status === "ALERT")),
    "bus"
  );

  const busOkList = sortFavoritesFirst(
    filterByQuery(data.bus.filter((item) => item.status !== "ALERT")),
    "bus"
  );

  const visibleBusOk = showAllBus
    ? busOkList
    : busOkList.slice(0, BUS_INITIAL_COUNT);

  const subwayTotal = data.summary?.subway_total ?? data.subway.length;
  const subwayAlerts = data.summary?.subway_alerts ?? subwayAlertsList.length;
  const busTotal = data.summary?.bus_total ?? data.bus.length;
  const busAlerts = data.summary?.bus_alerts ?? busAlertsList.length;
  const favoritesCount = favorites.length;

  const lastUpdated = data.meta?.generated_at
    ? new Date(data.meta.generated_at * 1000).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "--";

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#f8fafc",
          padding: "32px",
        }}
      >
        <h1 style={{ fontSize: "36px", fontWeight: 800, marginBottom: "8px" }}>
          NYC Transit Hub
        </h1>
        <p style={{ color: "#6b7280" }}>Loading transit status...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#f8fafc",
          padding: "32px",
        }}
      >
        <h1 style={{ fontSize: "36px", fontWeight: 800, marginBottom: "8px" }}>
          NYC Transit Hub
        </h1>
        <div style={{ color: "#dc2626", marginTop: "16px" }}>
          Error: {error}
        </div>
        <p style={{ color: "#6b7280", marginTop: "12px", maxWidth: "640px" }}>
          Make sure the Flask backend is running at {API_BASE_URL} and the MTA
          feed URLs are configured in the backend environment.
        </p>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "32px",
      }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "36px", fontWeight: 800, marginBottom: "8px" }}>
          NYC Transit Hub
        </h1>

        <p style={{ color: "#6b7280", marginBottom: "8px" }}>
          Real-time subway and bus service alerts
        </p>

        <p style={{ color: "#9ca3af", marginBottom: "24px" }}>
          Auto-refresh every 60 seconds
        </p>

        <div style={{ marginBottom: "24px" }}>
          <input
            type="text"
            placeholder="Search routes, messages, or details (e.g. A, 1, B12, delays)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              width: "100%",
              maxWidth: "480px",
              padding: "12px 14px",
              borderRadius: "12px",
              border: "1px solid #d1d5db",
              fontSize: "14px",
              outline: "none",
              background: "#ffffff",
            }}
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "16px",
            marginBottom: "40px",
          }}
        >
          <SummaryCard label="Subway Total" value={subwayTotal} />
          <SummaryCard label="Subway Alerts" value={subwayAlerts} />
          <SummaryCard label="Bus Total" value={busTotal} />
          <SummaryCard label="Bus Alerts" value={busAlerts} />
          <SummaryCard label="Favorites" value={favoritesCount} />
          <SummaryCard label="Last Updated" value={lastUpdated} />
        </div>

        <section style={{ marginBottom: "40px" }}>
          <h2 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "16px" }}>
            Subway Status
          </h2>

          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontWeight: 700, marginBottom: "10px" }}>
              🚨 Alerts ({subwayAlertsList.length})
            </div>

            {subwayAlertsList.length > 0 ? (
              subwayAlertsList.map((item) => (
                <div
                  key={`subway-alert-${item.route}`}
                  style={{ position: "relative" }}
                >
                  <div style={{ position: "absolute", top: "18px", right: "18px", zIndex: 2 }}>
                    <FavoriteButton
                      active={isFavorite("subway", item.route)}
                      onClick={() => toggleFavorite("subway", item.route)}
                    />
                  </div>
                  <StatusCard item={item} type="subway" />
                </div>
              ))
            ) : (
              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "18px",
                  padding: "18px",
                  color: "#15803d",
                  fontWeight: 600,
                }}
              >
                {query.trim()
                  ? "No matching subway alerts."
                  : "No active subway alerts."}
              </div>
            )}
          </div>

          <div>
            <div
              style={{
                fontWeight: 700,
                marginBottom: "10px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                cursor: "pointer",
                background: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: "14px",
                padding: "14px 16px",
              }}
              onClick={() => setShowSubwayOk((prev) => !prev)}
            >
              <span>✅ Good Service ({subwayOkList.length})</span>
              <span style={{ color: "#6b7280" }}>
                {showSubwayOk ? "Hide" : "Show"}
              </span>
            </div>

            {showSubwayOk && (
              <div style={{ marginTop: "14px" }}>
                {subwayOkList.length > 0 ? (
                  subwayOkList.map((item) => (
                    <div
                      key={`subway-ok-${item.route}`}
                      style={{ position: "relative" }}
                    >
                      <div style={{ position: "absolute", top: "18px", right: "18px", zIndex: 2 }}>
                        <FavoriteButton
                          active={isFavorite("subway", item.route)}
                          onClick={() => toggleFavorite("subway", item.route)}
                        />
                      </div>
                      <StatusCard item={item} type="subway" />
                    </div>
                  ))
                ) : (
                  <div
                    style={{
                      background: "#ffffff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "18px",
                      padding: "18px",
                      color: "#6b7280",
                    }}
                  >
                    No matching subway routes in good service.
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        <section>
          <h2 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "16px" }}>
            Bus Status
          </h2>

          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontWeight: 700, marginBottom: "10px" }}>
              🚨 Alerts ({busAlertsList.length})
            </div>

            {busAlertsList.length > 0 ? (
              busAlertsList.map((item) => (
                <div
                  key={`bus-alert-${item.route}`}
                  style={{ position: "relative" }}
                >
                  <div style={{ position: "absolute", top: "18px", right: "18px", zIndex: 2 }}>
                    <FavoriteButton
                      active={isFavorite("bus", item.route)}
                      onClick={() => toggleFavorite("bus", item.route)}
                    />
                  </div>
                  <StatusCard item={item} type="bus" />
                </div>
              ))
            ) : (
              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "18px",
                  padding: "18px",
                  color: "#15803d",
                  fontWeight: 600,
                }}
              >
                {query.trim()
                  ? "No matching bus alerts."
                  : "No active bus alerts."}
              </div>
            )}
          </div>

          <div>
            <div
              style={{
                fontWeight: 700,
                marginBottom: "10px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                cursor: "pointer",
                background: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: "14px",
                padding: "14px 16px",
              }}
              onClick={() => setShowBusOk((prev) => !prev)}
            >
              <span>✅ Good Service ({busOkList.length})</span>
              <span style={{ color: "#6b7280" }}>
                {showBusOk ? "Hide" : "Show"}
              </span>
            </div>

            {showBusOk && (
              <div style={{ marginTop: "14px" }}>
                {visibleBusOk.length > 0 ? (
                  visibleBusOk.map((item) => (
                    <div
                      key={`bus-ok-${item.route}`}
                      style={{ position: "relative" }}
                    >
                      <div style={{ position: "absolute", top: "18px", right: "18px", zIndex: 2 }}>
                        <FavoriteButton
                          active={isFavorite("bus", item.route)}
                          onClick={() => toggleFavorite("bus", item.route)}
                        />
                      </div>
                      <StatusCard item={item} type="bus" />
                    </div>
                  ))
                ) : (
                  <div
                    style={{
                      background: "#ffffff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "18px",
                      padding: "18px",
                      color: "#6b7280",
                    }}
                  >
                    No matching bus routes in good service.
                  </div>
                )}

                {busOkList.length > BUS_INITIAL_COUNT && (
                  <button
                    onClick={() => setShowAllBus((prev) => !prev)}
                    style={{
                      marginTop: "12px",
                      padding: "10px 16px",
                      borderRadius: "12px",
                      border: "1px solid #d1d5db",
                      background: "#ffffff",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    {showAllBus
                      ? "Show less"
                      : `Show more (${busOkList.length - BUS_INITIAL_COUNT} more)`}
                  </button>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}