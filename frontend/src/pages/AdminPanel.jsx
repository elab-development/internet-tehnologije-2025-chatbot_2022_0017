import { useEffect, useMemo, useState } from "react";
import api from "../api/api";

export default function AdminPanel() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all"); // all | booked | cancelled

  useEffect(() => {
    (async () => {
      try {
        setErr("");
        setLoading(true);

        // 🔥 OVO JE TVOJ ENDPOINT
        const res = await api.get("/admin/appointments/");
        setAppointments(res.data || []);
      } catch (e) {
        const s = e?.response?.status;
        setErr(
          s
            ? `Greška ${s}: nema pristupa ili endpoint ne radi.`
            : "Ne mogu učitati termine."
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();

    return appointments.filter((a) => {
      const st = String(a.status ?? "").toLowerCase();
      if (status !== "all" && st !== status) return false;

      if (!query) return true;

      const hay = [
        a.id,
        a.user?.username ?? "",
        a.branch?.name ?? "",
        a.start_time ?? "",
        a.status ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return hay.includes(query);
    });
  }, [appointments, q, status]);

  const badgeClass = (s) => {
    const k = String(s).toLowerCase();
    if (k === "booked") return "badge bg-success";
    if (k === "cancelled") return "badge bg-danger";
    return "badge bg-secondary";
  };

  const labelStatus = (s) => {
    const k = String(s).toLowerCase();
    if (k === "booked") return "Zakazan";
    if (k === "cancelled") return "Otkazan";
    return s;
  };

  if (loading) return <div className="card p-3">Učitavam termine…</div>;
  if (err) return <div className="alert alert-danger">{err}</div>;

  return (
    <div className="container py-4">
      <div className="admin-card">
        <div className="admin-head">
          <div>
            <h2 className="admin-title">Admin panel – svi termini</h2>
            <div className="admin-subtitle">Pretraga i filtriranje termina</div>
          </div>

          <div className="admin-controls">
            <input
              className="form-control form-control-sm admin-search"
              placeholder="Pretraži (korisnik, filijala, status...)"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />

            <div className="btn-group">
              <button
                className={"btn btn-sm " + (status === "all" ? "btn-light" : "btn-outline-light")}
                onClick={() => setStatus("all")}
              >
                Svi
              </button>
              <button
                className={"btn btn-sm " + (status === "booked" ? "btn-light" : "btn-outline-light")}
                onClick={() => setStatus("booked")}
              >
                Zakazani
              </button>
              <button
                className={"btn btn-sm " + (status === "cancelled" ? "btn-light" : "btn-outline-light")}
                onClick={() => setStatus("cancelled")}
              >
                Otkazani
              </button>
            </div>
          </div>
        </div>

        <div className="admin-table-wrap">
          <table className="table table-dark table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>ID</th>
                <th>Korisnik</th>
                <th>Filijala</th>
                <th>Vrijeme</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-white-50 py-4">
                    Nema rezultata za prikaz.
                  </td>
                </tr>
              ) : (
                filtered.map((a) => (
                  <tr key={a.id}>
                    <td className="text-white-50">#{a.id}</td>
                    <td>{a.user?.username}</td>
                    <td>{a.branch?.name}</td>
                    <td className="text-white-50">{a.start_time}</td>
                    <td>
                      <span className={badgeClass(a.status)}>
                        {labelStatus(a.status)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="admin-foot">
          <div className="text-white-50 small">
            Prikazano: <b className="text-white">{filtered.length}</b> / {appointments.length}
          </div>
        </div>
      </div>
    </div>
  );
}
