// Place at src/pages/FantasyHome.tsx  (route: /fantasy)
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import ScoringRules from "./ScoringRules";
import TournamentCreateForm from "../components/TournamentCreateForm";
// TODO: adjust to match how your app exposes the logged-in user
import { useAuth } from "../context/AuthContext";
import { apiError, getTournaments } from "./Fantasy";
import type { Tournament } from "./Fantasy";


const PHASE_LABEL = { open: "Open", locked: "Locked", complete: "Complete" } as const;

export default function FantasyHome() {
  const navigate = useNavigate();

  // TODO: your user object needs an `is_staff` flag for admin tools to show
  const { user } = useAuth() as { user?: { is_staff?: boolean } | null };
  const isAdmin = Boolean(user?.is_staff);

  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getTournaments()
      .then(setTournaments)
      .catch((e) => setError(apiError(e, "We couldn't load the tournaments.")))
      .finally(() => setLoading(false));
  }, []);

  const lockText = (t: Tournament) =>
    t.lock_at
      ? `Entries ${t.is_open ? "close" : "closed"} ${new Date(t.lock_at).toLocaleString([], {
          dateStyle: "medium",
          timeStyle: "short",
        })}`
      : "No lock time set";

  return (
    <AppLayout>
      <div className="detail-heading">
        <div>
          <div className="eyebrow">
            <span /> MARCH MADNESS FANTASY
          </div>
          <h1>Build your 10</h1>
          <p>Pick any 10 players. Lower seeds score more. Highest total wins.</p>
        </div>
      </div>

      {error && <div className="alert-error dashboard-alert">{error}</div>}

      <div className="fb-layout">
        <section className="panel fb-main">
          {isAdmin && (
            <TournamentCreateForm
              // Land on the new tournament's Admin tab so the next step is uploading players
              onCreated={(t) => navigate(`/fantasy/${t.id}?tab=admin`)}
            />
          )}

          <div className="eyebrow">TOURNAMENTS</div>
          <h2>Choose a tournament</h2>

          {loading ? (
            <p className="muted-empty">Loading tournaments...</p>
          ) : tournaments.length === 0 ? (
            <p className="muted-empty">
              {isAdmin
                ? "No tournaments yet. Create one above to get started."
                : "No tournaments yet. Check back soon."}
            </p>
          ) : (
            <div className="fb-card-list">
              {tournaments.map((t) => (
                <Link to={`/fantasy/${t.id}`} className="fb-card" key={t.id}>
                  <div className="fb-card-top">
                    <strong>{t.name}</strong>
                    <span className={`fb-pill ${t.phase}`}>{PHASE_LABEL[t.phase]}</span>
                  </div>
                  <div className="fb-card-meta">
                    <span>{t.player_count} players</span>
                    <span>{t.team_count} teams</span>
                    <span>{lockText(t)}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <aside className="detail-aside">
          <ScoringRules />
        </aside>
      </div>
    </AppLayout>
  );
}
