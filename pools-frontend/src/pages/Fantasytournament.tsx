// Place at src/pages/FantasyTournament.tsx  (route: /fantasy/:tournamentId)
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import ScoringRules from "./ScoringRules";
// TODO: adjust to match how your app exposes the logged-in user
import { useAuth } from "../context/AuthContext";
import {
  apiError,
  deleteTeam,
  getFantasyLeaderboard,
  getMyTeams,
  getTournament,
  setTournamentStatus,
  uploadPlayers,
  uploadStats,
} from "./Fantasy"
import type { FantasyTeam, LeaderboardRow, Phase, Tournament } from "./Fantasy";


type Tab = "teams" | "leaderboard" | "admin";

const PHASE_LABEL = { open: "Open", locked: "Locked", complete: "Complete" } as const;

export default function FantasyTournament() {
  const { tournamentId } = useParams();
  const id = Number(tournamentId);

  // TODO: your user object needs an `is_staff` flag for the Admin tab to show
  const { user } = useAuth() as { user?: { is_staff?: boolean } | null };
  const isAdmin = Boolean(user?.is_staff);

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [teams, setTeams] = useState<FantasyTeam[]>([]);
  const [leaders, setLeaders] = useState<LeaderboardRow[]>([]);
  const [tab, setTab] = useState<Tab>("teams");

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = async () => {
    try {
      setError("");
      const [t, mine, board] = await Promise.all([
        getTournament(id),
        getMyTeams(id),
        getFantasyLeaderboard(id),
      ]);
      setTournament(t);
      setTeams(mine);
      setLeaders(board);
    } catch (e) {
      setError(apiError(e, "We couldn't load this tournament."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (Number.isFinite(id) && id > 0) load();
  }, [id]);

  const remove = async (team: FantasyTeam) => {
    if (!window.confirm(`Delete "${team.name}"?`)) return;
    try {
      setBusy(`delete-${team.id}`);
      await deleteTeam(team.id);
      setNotice("Team deleted.");
      await load();
    } catch (e) {
      setError(apiError(e));
    } finally {
      setBusy("");
    }
  };

  const onUpload = async (kind: "players" | "stats", file?: File) => {
    if (!file) return;
    try {
      setBusy(kind);
      setError("");
      const result =
        kind === "players" ? await uploadPlayers(id, file) : await uploadStats(id, file);
      setNotice(
        `${kind === "players" ? "Players" : "Game stats"} uploaded: ${result.created} new, ${result.updated} updated.`
      );
      await load();
    } catch (e) {
      setError(apiError(e, "That upload failed."));
    } finally {
      setBusy("");
    }
  };

  const changeStatus = async (status: Phase) => {
    try {
      setBusy("status");
      setError("");
      await setTournamentStatus(id, status);
      setNotice(`Tournament marked ${PHASE_LABEL[status].toLowerCase()}.`);
      await load();
    } catch (e) {
      setError(apiError(e));
    } finally {
      setBusy("");
    }
  };

  const pts = (n: number) => n.toLocaleString();
  const open = tournament?.is_open ?? false;

  return (
    <AppLayout>
      <div className="detail-back">
        <Link to="/fantasy">← Back to all tournaments</Link>
      </div>

      <div className="detail-heading">
        <div>
          <div className="eyebrow">
            <span /> MARCH MADNESS FANTASY
          </div>
          <h1>{tournament?.name ?? "Tournament"}</h1>
          <p>
            {open
              ? `Pick any ${tournament?.roster_size ?? 10} players. You can submit as many teams as you want.`
              : "Entries are closed. Follow the leaderboard as the games play out."}
          </p>
        </div>

        {tournament && (
          <span className={`fb-pill ${tournament.phase}`}>{PHASE_LABEL[tournament.phase]}</span>
        )}
      </div>

      {error && <div className="alert-error dashboard-alert">{error}</div>}

      {notice && (
        <div className="alert-success">
          {notice}
          <button onClick={() => setNotice("")}>×</button>
        </div>
      )}

      <div className="detail-stats">
        <div className="detail-stat">
          <span>ELIGIBLE PLAYERS</span>
          <strong>{tournament?.player_count ?? "—"}</strong>
          <small>In the pool</small>
        </div>
        <div className="detail-stat">
          <span>TEAMS SUBMITTED</span>
          <strong>{tournament?.team_count ?? "—"}</strong>
          <small>Across all users</small>
        </div>
        <div className="detail-stat">
          <span>YOUR TEAMS</span>
          <strong>{teams.length}</strong>
          <small>In this tournament</small>
        </div>
        <div className="detail-stat">
          <span>ROSTER SIZE</span>
          <strong>{tournament?.roster_size ?? 10}</strong>
          <small>Players per team</small>
        </div>
      </div>

      <div className="fb-layout">
        <section className="panel fb-main">
          <div className="fb-tabs">
            <button className={tab === "teams" ? "active" : ""} onClick={() => setTab("teams")}>
              My teams
            </button>
            <button
              className={tab === "leaderboard" ? "active" : ""}
              onClick={() => setTab("leaderboard")}
            >
              Leaderboard
            </button>
            {isAdmin && (
              <button className={tab === "admin" ? "active" : ""} onClick={() => setTab("admin")}>
                Admin
              </button>
            )}
          </div>

          {loading ? (
            <p className="muted-empty">Loading...</p>
          ) : tab === "teams" ? (
            <>
              {open && (
                <Link to={`/fantasy/${id}/teams/new`} className="primary-button fb-link-button">
                  Build a new team →
                </Link>
              )}

              {teams.length === 0 ? (
                <p className="muted-empty">
                  {open
                    ? "You haven't submitted a team yet. Build one to get started."
                    : "You didn't submit any teams for this tournament."}
                </p>
              ) : (
                <div className="fb-card-list">
                  {teams.map((team) => (
                    <div className="fb-card static" key={team.id}>
                      <div className="fb-card-top">
                        <strong>{team.name}</strong>
                        <span className="fb-total">{pts(team.total_points)} pts</span>
                      </div>

                      <div className="fb-chips">
                        {team.players.map((p) => (
                          <span className="fb-chip" key={p.id}>
                            {p.name}
                            <em className={`m${p.multiplier}`}>{p.multiplier}×</em>
                          </span>
                        ))}
                      </div>

                      <div className="fb-card-actions">
                        <Link to={`/fantasy/teams/${team.id}`}>View breakdown</Link>
                        {team.can_edit && (
                          <>
                            <Link to={`/fantasy/${id}/teams/${team.id}/edit`}>Edit</Link>
                            <button
                              type="button"
                              onClick={() => remove(team)}
                              disabled={busy === `delete-${team.id}`}
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : tab === "leaderboard" ? (
            leaders.length === 0 ? (
              <p className="muted-empty">No teams have been submitted yet.</p>
            ) : (
              <div className="fb-table-wrap">
                <table className="fb-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Team</th>
                      <th>Owner</th>
                      <th className="num">Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaders.map((row) => (
                      <tr key={row.team_id} className={row.is_mine ? "mine" : ""}>
                        <td>{row.rank}</td>
                        <td>
                          {row.is_mine || !open ? (
                            <Link to={`/fantasy/teams/${row.team_id}`}>{row.team_name}</Link>
                          ) : (
                            row.team_name
                          )}
                        </td>
                        <td>{row.first_name || row.username}</td>
                        <td className="num">{pts(row.total_points)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            <div className="fb-admin">
              <h3>Upload data</h3>

              <label className="fb-upload">
                <span>
                  <strong>Player list (JSON)</strong>
                  <small>{`{"players": [{"external_id", "name", "school", "seed"}]}`}</small>
                </span>
                <input
                  type="file"
                  accept=".json,application/json"
                  disabled={busy === "players"}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    onUpload("players", file);
                  }}
                />
              </label>

              <label className="fb-upload">
                <span>
                  <strong>Game stats (JSON)</strong>
                  <small>{`{"games": [{"external_id", "round", "points"}]}`}</small>
                </span>
                <input
                  type="file"
                  accept=".json,application/json"
                  disabled={busy === "stats"}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    onUpload("stats", file);
                  }}
                />
              </label>

              <h3>Tournament status</h3>
              <div className="fb-status-buttons">
                {(["open", "locked", "complete"] as Phase[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={tournament?.status === s ? "active" : ""}
                    disabled={busy === "status"}
                    onClick={() => changeStatus(s)}
                  >
                    {PHASE_LABEL[s]}
                  </button>
                ))}
              </div>
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
