import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const linkClass = ({ isActive }) =>
    isActive ? "navLink navLinkActive" : "navLink";

  return (
    <div className="navbar">
      <div className="navInner">
        <div className="brand">
          <span className="brandDot" />
          Čitaonica
        </div>

        <div className="navLinks">
          <NavLink to="/" className={linkClass}>Početna</NavLink>
          <NavLink to="/branches" className={linkClass}>Filijale</NavLink>
          <NavLink to="/my-appointments" className={linkClass}>Moji termini</NavLink>
          <NavLink to="/chat" className={linkClass}>Chat</NavLink>

          {!user ? (
            <>
              <NavLink to="/login" className={linkClass}>Login</NavLink>
              <NavLink to="/register" className={linkClass}>Register</NavLink>
            </>
          ) : (
            <>
              <span className="muted" style={{ padding: "0 6px", fontSize: 13 }}>
                Ulogovan: <b style={{ color: "rgba(255,255,255,0.9)" }}>{user.username}</b>
              </span>
              <button
                className="btn"
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
