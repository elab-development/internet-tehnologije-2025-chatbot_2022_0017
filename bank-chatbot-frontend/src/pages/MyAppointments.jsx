import { useEffect, useMemo, useState } from "react";
import { fetchMyAppointments } from "../api/appointments";

export default function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyAppointments()
      .then((data) => {
        const list = Array.isArray(data) ? data : data.appointments;
        setAppointments(list || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const fmt = useMemo(
    () => (iso) =>
      new Date(iso).toLocaleString("sr-RS", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
    []
  );

  return (
    <div className="container">
      <div className="card">
        <div className="row" style={{ marginBottom: 14 }}>
          <h2 className="cardTitle" style={{ margin: 0 }}>Moji termini</h2>
          <span className="pill">Prikaz zakazanih termina</span>
        </div>

        {loading && <p className="muted">Učitavam termine…</p>}

        {!loading && appointments.length === 0 && (
          <p className="muted">Nemaš zakazane termine.</p>
        )}

        {!loading && appointments.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {appointments.map((a) => (
              <div
                key={a.id}
                className="card"
                style={{
                  padding: 14,
                  borderRadius: 16,
                  background: "rgba(255,255,255,0.05)",
                }}
              >
                <div className="row">
                  <div>
                    <div style={{ fontWeight: 700 }}>{a.branch?.name || "Filijala"}</div>
                    <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>
                      {fmt(a.start_time)}
                    </div>
                  </div>

                  <span
                    className="pill"
                    style={{
                      color: a.status === "booked" ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.65)",
                    }}
                  >
                    {a.status === "booked" ? "Zakazano" : "Otkazano"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
