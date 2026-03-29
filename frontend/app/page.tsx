"use client";

import { useEffect, useState } from "react";

type SubwayItem = {
  line: string;
  status: string;
};

type BusItem = {
  route: string;
  status: string;
};

type TransitData = {
  subway: SubwayItem[];
  bus: BusItem[];
};

export default function Home() {
  const [data, setData] = useState<TransitData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/transit/status`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch transit status");
        }
        return res.json();
      })
      .then((json: TransitData) => {
        setData(json);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <main style={{ padding: "24px" }}>
      <h1>NYC Transit Hub 🚇</h1>

      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}

      {data && (
        <div>
          <h2>Subway</h2>
          <ul>
            {data.subway.map((item, index) => (
              <li key={index}>
                Line {item.line}: {item.status}
              </li>
            ))}
          </ul>

          <h2>Bus</h2>
          <ul>
            {data.bus.map((item, index) => (
              <li key={index}>
                Route {item.route}: {item.status}
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}