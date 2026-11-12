// Place at src/pages/CreateTournament.tsx  (route: /fantasy/new)
import { Link, useNavigate } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import TournamentCreateForm from "../components/TournamentCreateForm";
// TODO: adjust to match how your app exposes the logged-in user
import { useAuth } from "../context/AuthContext";


export default function CreateTournament() {
  const navigate = useNavigate();

  // TODO: your user object needs an `is_staff` flag
  const { user } = useAuth() as { user?: { is_staff?: boolean } | null };
  const isAdmin = Boolean(user?.is_staff);

  return (
    <AppLayout>
      <div className="detail-back">
        <Link to="/dashboard">← Back to dashboard</Link>
      </div>

      <div className="detail-heading">
        <div>
          <div className="eyebrow">
            <span /> MARCH MADNESS FANTASY
          </div>
          <h1>Create a tournament</h1>
          <p>Set it up here, then load the eligible players on the next screen.</p>
        </div>
      </div>

      {!isAdmin ? (
        <div className="alert-error dashboard-alert">
          Only admins can create tournaments.
        </div>
      ) : (
        <div className="fb-layout">
          <TournamentCreateForm
            defaultOpen
            onCreated={(t) => navigate(`/fantasy/${t.id}?tab=admin`)}
            onCancel={() => navigate("/dashboard")}
          />

          <aside className="detail-aside">
            <section className="panel aside-panel">
              <div className="eyebrow">WHAT HAPPENS NEXT</div>
              <h3>Three quick steps</h3>

              <div className="fb-rule">
                <span className="fa-step">1</span>
                <div>
                  <strong>Create it</strong>
                  <small>Name, year, and when entries close.</small>
                </div>
              </div>

              <div className="fb-rule">
                <span className="fa-step">2</span>
                <div>
                  <strong>Upload the players</strong>
                  <small>A JSON list of everyone eligible, with seeds.</small>
                </div>
              </div>

              <div className="fb-rule">
                <span className="fa-step">3</span>
                <div>
                  <strong>Upload stats as games finish</strong>
                  <small>Points per player per game. The leaderboard updates.</small>
                </div>
              </div>
            </section>
          </aside>
        </div>
      )}
    </AppLayout>
  );
}
