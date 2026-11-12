import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const initials = (user?.first_name || user?.username || "P").slice(0, 1).toUpperCase();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <NavLink to="/" className="brand">
          <span className="brand-mark">P</span>
          <span>POOL<span className="brand-light">SIDE</span></span>
        </NavLink>
        <div className="side-label">WORKSPACE</div>
        <nav className="side-nav">
          <NavLink to="/" end className={({ isActive }) => `side-link ${isActive ? "active" : ""}`}>
            <span className="nav-symbol">▦</span> Overview
          </NavLink>
          <NavLink to="/" className="side-link">
            <span className="nav-symbol">◫</span> My pools
          </NavLink>
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card">
            <div className="help-icon">✦</div>
            <strong>Make game day better</strong>
            <p>Bring everyone together with a pool of your own.</p>
            <NavLink to="/">Create a pool <span>↗</span></NavLink>
          </div>
          <div className="profile-row">
            <div className="avatar">{initials}</div>
            <div className="profile-copy"><strong>{user?.first_name || user?.username || "Player"}</strong><span>Pool member</span></div>
            <button className="icon-button logout-button" onClick={handleLogout} title="Log out">↗</button>
          </div>
        </div>
      </aside>
      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb"><span>Workspace</span><b>/</b><strong>Overview</strong></div>
          <div className="topbar-right"><span className="live-dot"/> All systems operational <div className="top-avatar">{initials}</div></div>
        </header>
        <div className="content-area">{children}</div>
        <footer className="app-footer"><span>© {new Date().getFullYear()} Poolside</span><span>Made for game day <b>✦</b></span></footer>
      </main>
    </div>
  );
}
