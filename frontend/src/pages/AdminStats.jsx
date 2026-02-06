import { useEffect, useMemo, useState } from "react";
import api from "../api/api";

import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function AdminStats() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [byBranch, setByBranch] = useState([]);
  const [usersByRole, setUsersByRole] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [byStatus, setByStatus] = useState([]);
  const PALETTE = [
  "#4F46E5", // indigo
  "#06B6D4", // cyan
  "#22C55E", // green
  "#F59E0B", // amber
  "#EF4444", // red
  "#A855F7", // purple
];

  useEffect(() => {
    (async () => {
      try {
        setErr("");
        setLoading(true);

        const [a, b, c, d] = await Promise.all([
          api.get("/admin/stats/appointments-by-branch/"),
          api.get("/admin/stats/users-by-role/"),
          api.get("/admin/stats/top-users/?limit=5"),
          api.get("/admin/stats/appointments-by-status/"),
        ]);

        setByBranch(a.data || []);
        setUsersByRole(b.data || []);
        setTopUsers(c.data || []);
        setByStatus(d.data || []);
      } catch (e) {
        const status = e?.response?.status;
        setErr(
          status
            ? `Greška ${status}: nema pristupa ili endpoint ne radi.`
            : "Greška: nije moguće učitati statistiku."
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const kpis = useMemo(() => {
    const totalAppointments = byStatus.reduce((acc, x) => acc + (x.total ?? 0), 0);
    const booked = byStatus.find((x) => String(x.status).toLowerCase() === "booked")?.total ?? 0;
    const cancelled = byStatus.find((x) => String(x.status).toLowerCase() === "cancelled")?.total ?? 0;
    const totalUsers = usersByRole.reduce((acc, x) => acc + (x.total ?? 0), 0);

    return { totalAppointments, booked, cancelled, totalUsers };
  }, [byStatus, usersByRole]);

  const baseOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: { boxWidth: 10, boxHeight: 10, padding: 12 },
        },
        tooltip: { enabled: true },
        title: { display: false },
      },
    }),
    []
  );

  const barOptions = useMemo(
    () => ({
      ...baseOptions,
      plugins: {
        ...baseOptions.plugins,
        legend: { display: false },
      },
      scales: {
        x: { ticks: { maxRotation: 0, autoSkip: true } },
        y: { beginAtZero: true },
      },
    }),
    [baseOptions]
  );

  const doughnutOptions = useMemo(
    () => ({
      ...baseOptions,
      cutout: "65%",
    }),
    [baseOptions]
  );

const branchChart = useMemo(() => {
  const labels = byBranch.map((x) => x.branch__name ?? x.branch ?? "Nepoznata filijala");
  const values = byBranch.map((x) => x.total ?? 0);

  return {
    labels,
    datasets: [
      {
        label: "Broj termina",
        data: values,
        backgroundColor: labels.map((_, i) => PALETTE[i % PALETTE.length]),
        borderRadius: 10,
      },
    ],
  };
}, [byBranch]);


const roleChart = useMemo(() => {
  const labels = usersByRole.map((x) => x.role ?? "unknown");
  const values = usersByRole.map((x) => x.total ?? 0);

  return {
    labels,
    datasets: [
      {
        label: "Korisnici",
        data: values,
        backgroundColor: labels.map((_, i) => PALETTE[i % PALETTE.length]),
        borderWidth: 2,
      },
    ],
  };
}, [usersByRole]);


const topUsersChart = useMemo(() => {
  const labels = topUsers.map((x) => x.user__username ?? "unknown");
  const values = topUsers.map((x) => x.total ?? 0);

  return {
    labels,
    datasets: [
      {
        label: "Zakazani termini",
        data: values,
        backgroundColor: labels.map((_, i) => PALETTE[i % PALETTE.length]),
        borderRadius: 10,
      },
    ],
  };
}, [topUsers]);


const statusChart = useMemo(() => {
  const labels = byStatus.map((x) => x.status ?? "unknown");
  const values = byStatus.map((x) => x.total ?? 0);

  // po statusu možeš čak i fiksno:
  const statusColor = (s) => {
    const k = String(s).toLowerCase();
    if (k === "booked") return "#22C55E";
    if (k === "cancelled") return "#EF4444";
    return "#06B6D4";
  };

  return {
    labels,
    datasets: [
      {
        label: "Termini",
        data: values,
        backgroundColor: labels.map(statusColor),
        borderWidth: 2,
      },
    ],
  };
}, [byStatus]);


  if (loading) return <div className="card p-3">Učitavanje statistike...</div>;
  if (err) return <div className="alert alert-danger">{err}</div>;

  const nothing =
    byBranch.length === 0 && usersByRole.length === 0 && topUsers.length === 0 && byStatus.length === 0;

  if (nothing) return <div className="alert alert-warning">Nema podataka za prikaz.</div>;

  return (
    <div className="container py-3">
      <div className="d-flex flex-wrap align-items-end justify-content-between gap-2 mb-3">
        <div>
          <h2 className="mb-1">Admin statistika</h2>
          <div className="text-muted">Pregled termina i korisnika</div>
        </div>
      </div>

      {/* KPI cards */}
      <div className="row g-3 mb-3">
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card stat-kpi">
            <div className="card-body">
              <div className="kpi-label">Ukupno termina</div>
              <div className="kpi-value">{kpis.totalAppointments}</div>
            </div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card stat-kpi">
            <div className="card-body">
              <div className="kpi-label">Booked</div>
              <div className="kpi-value">{kpis.booked}</div>
            </div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card stat-kpi">
            <div className="card-body">
              <div className="kpi-label">Cancelled</div>
              <div className="kpi-value">{kpis.cancelled}</div>
            </div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card stat-kpi">
            <div className="card-body">
              <div className="kpi-label">Ukupno korisnika</div>
              <div className="kpi-value">{kpis.totalUsers}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main grid: 2 velike + 2 manje */}
      <div className="row g-3">
        {/* LEFT big */}
        <div className="col-12 col-lg-7">
          <div className="card stat-card h-100">
            <div className="card-body">
              <div className="stat-head">
                <div>
                  <div className="stat-title">Broj termina po filijali</div>
                  <div className="stat-subtitle">Uporedi opterećenje filijala</div>
                </div>
              </div>

              {byBranch.length === 0 ? (
                <div className="text-muted">Nema podataka.</div>
              ) : (
                <div className="chart-box chart-lg">
                  <Bar data={branchChart} options={barOptions} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT big */}
        <div className="col-12 col-lg-5">
          <div className="card stat-card h-100">
            <div className="card-body">
              <div className="stat-head">
                <div>
                  <div className="stat-title">Korisnici po ulozi</div>
                  <div className="stat-subtitle">Raspodjela admin/employee/user</div>
                </div>
              </div>

              {usersByRole.length === 0 ? (
                <div className="text-muted">Nema podataka.</div>
              ) : (
                <div className="chart-box chart-md">
                  <Doughnut data={roleChart} options={doughnutOptions} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom left */}
        <div className="col-12 col-lg-7">
          <div className="card stat-card">
            <div className="card-body">
              <div className="stat-head">
                <div>
                  <div className="stat-title">Top korisnici</div>
                  <div className="stat-subtitle">Po broju zakazanih termina</div>
                </div>
              </div>

              {topUsers.length === 0 ? (
                <div className="text-muted">Nema podataka.</div>
              ) : (
                <div className="chart-box chart-md">
                  <Bar data={topUsersChart} options={barOptions} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom right */}
        <div className="col-12 col-lg-5">
          <div className="card stat-card">
            <div className="card-body">
              <div className="stat-head">
                <div>
                  <div className="stat-title">Termini po statusu</div>
                  <div className="stat-subtitle">booked vs cancelled</div>
                </div>
              </div>

              {byStatus.length === 0 ? (
                <div className="text-muted">Nema podataka.</div>
              ) : (
                <div className="chart-box chart-md">
                  <Doughnut data={statusChart} options={doughnutOptions} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
