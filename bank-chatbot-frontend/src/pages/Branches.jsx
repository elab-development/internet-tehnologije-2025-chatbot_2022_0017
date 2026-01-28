import { useEffect, useState } from "react";
import { getBranches } from "../api/appointments";

export default function Branches() {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBranches()
      .then((data) => setBranches(Array.isArray(data) ? data : data.branches || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="card">
      <h2 className="cardTitle">Filijale</h2>

      {loading && <p className="muted">Učitavam filijale…</p>}

      {!loading && branches.length === 0 && (
        <p className="muted">Nema dostupnih filijala.</p>
      )}

      {!loading && branches.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {branches.map((b) => (
            <div
              key={b.id}
              className="card"
              style={{ padding: 14, borderRadius: 16, background: "rgba(255,255,255,0.05)" }}
            >
              <div style={{ fontWeight: 800 }}>{b.name}</div>
              <div className="muted" style={{ marginTop: 4 }}>
                {b.address}, {b.city}
              </div>
              <div className="muted" style={{ marginTop: 6, fontSize: 13 }}>
                Radno vrijeme: {b.open_time}–{b.close_time} • Slot: {b.slot_minutes} min
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
