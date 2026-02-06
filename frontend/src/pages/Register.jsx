import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthCard from "../components/AuthCard";
import { registerUser } from "../api/auth"; 
export default function Register() {
  const nav = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  function validate() {
    if (username.trim().length < 3) return "Username mora imati bar 3 karaktera.";
    if (!email.includes("@")) return "Unesi validan email.";
    if (p1.length < 6) return "Lozinka mora imati bar 6 karaktera.";
    if (p1 !== p2) return "Lozinke se ne poklapaju.";
    return "";
  }

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setOk("");

    const v = validate();
    if (v) return setErr(v);

    setLoading(true);
    try {
      await registerUser({ username, email, password: p1, password2: p2 });
      setOk("Nalog je kreiran. Možeš da se prijaviš.");
      setTimeout(() => nav("/login"), 800);
    } catch (e2) {
      const data = e2?.response?.data;
      const msg =
        (data && JSON.stringify(data)) ||
        "Registracija nije uspjela. Provjeri podatke.";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  }

  const disabled = loading;

  return (
    <AuthCard
      title="Registracija"
      subtitle="Kreiraj nalog za rezervacije u filijalama."
    >
      {err && <div className="alert alert-danger py-2">{err}</div>}
      {ok && <div className="alert alert-success py-2">{ok}</div>}

      <form onSubmit={onSubmit} className="d-grid gap-3">
        <div>
          <label className="form-label">Korisničko ime</label>
          <input
            className="form-control"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            placeholder="Izaberi username"
          />
        </div>

        <div>
          <label className="form-label">Email</label>
          <input
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            placeholder="npr. milan@mail.com"
          />
        </div>

        <div>
          <label className="form-label">Lozinka</label>
          <input
            className="form-control"
            type={showPwd ? "text" : "password"}
            value={p1}
            onChange={(e) => setP1(e.target.value)}
            autoComplete="new-password"
            placeholder="Min 6 karaktera"
          />
        </div>

        <div>
          <label className="form-label">Potvrdi lozinku</label>
          <div className="input-group">
            <input
              className="form-control"
              type={showPwd ? "text" : "password"}
              value={p2}
              onChange={(e) => setP2(e.target.value)}
              autoComplete="new-password"
              placeholder="Ponovi lozinku"
            />
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => setShowPwd((s) => !s)}
            >
              {showPwd ? "Hide" : "Show"}
            </button>
          </div>
          {p1 && p2 && p1 !== p2 && (
            <div className="text-danger small mt-1">Lozinke se ne poklapaju.</div>
          )}
        </div>

        <button className="btn btn-primary" disabled={disabled}>
          {loading ? "Kreiram nalog..." : "Registruj se"}
        </button>

        <div className="text-center">
          <span className="text-muted">Već imaš nalog?</span>{" "}
          <Link to="/login" className="fw-semibold">
            Uloguj se
          </Link>
        </div>
      </form>
    </AuthCard>
  );
}
