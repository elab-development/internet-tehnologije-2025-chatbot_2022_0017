import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthCard from "../components/AuthCard";
import { loginUser } from "../api/auth"; 
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const nav = useNavigate();
  const { refreshUser } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await loginUser({ username, password });
      await refreshUser?.();
      nav("/reserve");
    } catch (e2) {
      const msg =
        e2?.response?.data?.detail ||
        "Pogrešan username/lozinka ili server nije dostupan.";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  }

  const disabled = loading || !username.trim() || password.length < 1;

  return (
    <AuthCard
      title="Prijava"
      subtitle="Pristupi rezervaciji termina i chatbot-u."
    >
      {err && <div className="alert alert-danger py-2">{err}</div>}

      <form onSubmit={onSubmit} className="d-grid gap-3">
        <div>
          <label className="form-label">Korisničko ime</label>
          <input
            className="form-control"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            placeholder="npr. milan20220017"
          />
        </div>

        <div>
          <label className="form-label">Lozinka</label>
          <div className="input-group">
            <input
              className="form-control"
              type={showPwd ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="Unesi lozinku"
            />
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => setShowPwd((s) => !s)}
              aria-label="Toggle password"
            >
              {showPwd ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <button className="btn btn-primary" disabled={disabled}>
          {loading ? "Prijavljujem..." : "Uloguj se"}
        </button>

        <div className="text-center">
          <span className="text-muted">Nemaš nalog?</span>{" "}
          <Link to="/register" className="fw-semibold">
            Registruj se
          </Link>
        </div>
      </form>
    </AuthCard>
  );
}
