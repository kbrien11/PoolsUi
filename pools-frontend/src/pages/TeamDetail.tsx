// Place at src/pages/TeamDetail.tsx  (route: /fantasy/teams/:teamId)
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import ScoringRules from "../components/ScoringRules";
import { apiError, getFantasyTeam } from "../api/fantasy";
import type { FantasyTeam } from "../api/fantasy";
import "./fantasy.css";

export default function TeamDetail() {
  const { teamId } = useParams();
  const id = Number(teamId);

  const [team, setTeam] = useState<FantasyTeam | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!Number.isFinite(id) || id <= 0) return;
    getFantasyTeam(id)
      .then(setTeam)
      .catch((e) => setError(apiError(e, "We couldn't load this team.")))
      .finally(() => setLoading(false));
  }, [id]);

  const pts = (n: number) => n.toLocaleString();

  const totalGames = team?.players.reduce((sum, p) => sum + p.games_played, 0) ?? 0;
  const topScorer = team?.players[0]; // already sorted by total points on the server

  return (
    <AppLayout>
      <div className="detail-back">
        <Link to={team ? `/fantasy/${team.tournament_id}` : "/fantasy"}>
          ← Back to {team?.tournament_name ?? "tournaments"}
        </Link>
      </div>

      <div className="detail-heading">
        <div>
          <div className="eyebrow">
            <span /> TEAM BREAKDOWN
          </div>
          <h1>{team?.name ?? "Team"}</h1>
          <p>{team ? `Submitted by ${team.username}` : ""}</p>
        </div>

        {team?.can_edit && (
          <Link
            to={`/fantasy/${team.tournament_id}/teams/${team.id}/edit`}
            className="primary-button fb-link-button"
          >
            Edit team
          </Link>
        )}
      </div>

      {error && <div className="alert-error dashboard-alert">{error}</div>}

      {team && (
        <div className="detail-stats">
          <div className="detail-stat">
            <span>TOTAL POINTS</span>
            <strong>{pts(team.total_points)}</strong>
            <small>With multipliers</small>
          </div>
          <div className="detail-stat">
            <span>GAMES PLAYED</span>
            <strong>{totalGames}</strong>
            <small>By all {team.players.length} players</small>
          </div>
          <div className="detail-stat">
            <span>TOP SCORER</span>
            <strong className="fb-small-strong">{topScorer?.name ?? "—"}</strong>
            <small>{topScorer ? `${pts(topScorer.total_points)} pts` : ""}</small>
          </div>
          <div className="detail-stat">
            <span>ROSTER SIZE</span>
            <strong>{team.players.length}</strong>
            <small>Players</small>
          </div>
        </div>
      )}

      <div className="fb-layout">
        <section className="panel fb-main">
          <div className="eyebrow">ROSTER</div>
          <h2>Player scoring</h2>

          {loading ? (
            <p className="muted-empty">Loading...</p>
          ) : !team ? null : (
            <div className="fb-table-wrap">
              <table className="fb-table">
                <thead>
                  <tr>
                    <th>Player</th>
                    <th>Seed</th>
                    <th>Mult.</th>
                    <th className="num">Games</th>
                    <th className="num">Points</th>
                    <th className="num">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {team.players.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <strong>{p.name}</strong>
                        <small className="fb-sub">{p.school}</small>
                      </td>
                      <td>{p.seed}</td>
                      <td>
                        <span className={`fb-mult m${p.multiplier}`}>{p.multiplier}×</span>
                      </td>
                      <td className="num">{p.games_played}</td>
                      <td className="num">{p.raw_points}</td>
                      <td className="num">
                        <strong>{pts(p.total_points)}</strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
