// Place at src/pages/TeamBuilder.tsx
// Routes: /fantasy/:tournamentId/teams/new  and  /fantasy/:tournamentId/teams/:teamId/edit
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import ScoringRules from "./ScoringRules";
import {
  apiError,
  createTeam,
  getFantasyPlayers,
  getFantasyTeam,
  getTournament,
  updateTeam,
} from "./Fantasy";
import type { FantasyPlayer, Tournament } from "./Fantasy";
import "./fantasy.css";

type Tier = "all" | "1" | "2" | "3";

export default function TeamBuilder() {
  const { tournamentId, teamId } = useParams();
  const tid = Number(tournamentId);
  const editingId = teamId ? Number(teamId) : null;
  const navigate = useNavigate();

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [players, setPlayers] = useState<FantasyPlayer[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [name, setName] = useState("");

  const [search, setSearch] = useState("");
  const [tier, setTier] = useState<Tier>("all");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const run = async () => {
      try {
        const [t, list, team] = await Promise.all([
          getTournament(tid),
          getFantasyPlayers(tid),
          editingId ? getFantasyTeam(editingId) : Promise.resolve(null),
        ]);
        setTournament(t);
        setPlayers(list);

        if (team) {
          if (!team.can_edit) {
            setError("This team can't be edited.");
          }
          setName(team.name);
          setSelected(team.players.map((p) => p.id));
        }
      } catch (e) {
        setError(apiError(e, "We couldn't load the players."));
      } finally {
        setLoading(false);
      }
    };

    if (Number.isFinite(tid) && tid > 0) run();
  }, [tid, editingId]);

  const size = tournament?.roster_size ?? 10;
  const closed = tournament ? !tournament.is_open : false;
  const full = selected.length >= size;

  const byId = useMemo(() => new Map(players.map((p) => [p.id, p])), [players]);

  const selectedPlayers = useMemo(
    () => selected.map((pid) => byId.get(pid)).filter(Boolean) as FantasyPlayer[],
    [selected, byId]
  );

  const mix = useMemo(() => {
    const counts = { 1: 0, 2: 0, 3: 0 } as Record<number, number>;
    selectedPlayers.forEach((p) => (counts[p.multiplier] += 1));
    return counts;
  }, [selectedPlayers]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return players.filter((p) => {
      if (tier !== "all" && p.multiplier !== Number(tier)) return false;
      if (!q) return true;
      return p.name.toLowerCase().includes(q) || p.school.toLowerCase().includes(q);
    });
  }, [players, search, tier]);

  const toggle = (pid: number) => {
    if (saving || closed) return;
    setSelected((current) => {
      if (current.includes(pid)) return current.filter((x) => x !== pid);
      if (current.length >= size) return current;
      return [...current, pid];
    });
  };

  const save = async () => {
    if (selected.length !== size) return;
    try {
      setSaving(true);
      setError("");
      const body = { name: name.trim(), player_ids: selected };
      const team = editingId ? await updateTeam(editingId, body) : await createTeam(tid, body);
      navigate(`/fantasy/teams/${team.id}`);
    } catch (e) {
      setError(apiError(e, "We couldn't save this team."));
      setSaving(false);
    }
  };

  const tierButtons: { key: Tier; label: string }[] = [
    { key: "all", label: "All" },
    { key: "1", label: "1× (seeds 1–5)" },
    { key: "2", label: "2× (seeds 6–11)" },
    { key: "3", label: "3× (seeds 12–16)" },
  ];

  return (
    <AppLayout>
      <div className="detail-back">
        <Link to={`/fantasy/${tid}`}>← Back to {tournament?.name ?? "tournament"}</Link>
      </div>

      <div className="detail-heading">
        <div>
          <div className="eyebrow">
            <span /> TEAM BUILDER
          </div>
          <h1>{editingId ? "Edit your team" : "Build a new team"}</h1>
          <p>Pick exactly {size} players. Lower seeds earn bigger multipliers.</p>
        </div>
      </div>

      {error && <div className="alert-error dashboard-alert">{error}</div>}
      {closed && (
        <div className="alert-error dashboard-alert">
          Entries are closed for this tournament, so teams can't be changed.
        </div>
      )}

      <div className="fb-layout">
        {/* PLAYER POOL */}
        <section className="panel fb-main">
          <div className="eyebrow">PLAYER POOL</div>
          <h2>Choose your players</h2>

          <div className="fb-filters">
            <input
              type="search"
              placeholder="Search players or schools"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <div className="fb-tier-buttons">
              {tierButtons.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  className={tier === t.key ? "active" : ""}
                  onClick={() => setTier(t.key)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <p className="muted-empty">Loading players...</p>
          ) : visible.length === 0 ? (
            <p className="muted-empty">No players match your filters.</p>
          ) : (
            <div className="fb-player-list">
              {visible.map((p) => {
                const picked = selected.includes(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    className={`fb-player ${picked ? "picked" : ""}`}
                    disabled={closed || saving || (!picked && full)}
                    onClick={() => toggle(p.id)}
                    aria-pressed={picked}
                  >
                    <span className="fb-seed">{p.seed}</span>
                    <span className="fb-player-main">
                      <strong>{p.name}</strong>
                      <small>
                        {p.school}
                        {p.position ? ` · ${p.position}` : ""}
                      </small>
                    </span>
                    <span className={`fb-mult m${p.multiplier}`}>{p.multiplier}×</span>
                    <span className="fb-check">{picked ? "✓" : "+"}</span>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* ROSTER */}
        <aside className="detail-aside">
          <section className="panel aside-panel">
            <div className="eyebrow">YOUR ROSTER</div>
            <h3>
              {selected.length} / {size} players
            </h3>

            <input
              className="fb-name-input"
              type="text"
              placeholder="Team name (optional)"
              maxLength={80}
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={closed || saving}
            />

            <div className="fb-slots">
              {Array.from({ length: size }, (_, i) => {
                const p = selectedPlayers[i];
                return p ? (
                  <div className="fb-slot filled" key={p.id}>
                    <span className={`fb-mult m${p.multiplier}`}>{p.multiplier}×</span>
                    <span className="fb-slot-name">
                      {p.name}
                      <small>{p.school}</small>
                    </span>
                    <button
                      type="button"
                      onClick={() => toggle(p.id)}
                      disabled={saving || closed}
                      aria-label={`Remove ${p.name}`}
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="fb-slot" key={`empty-${i}`}>
                    <span className="fb-slot-empty">Empty slot {i + 1}</span>
                  </div>
                );
              })}
            </div>

            <p className="fb-mix">
              {mix[1]} × 1× &nbsp;·&nbsp; {mix[2]} × 2× &nbsp;·&nbsp; {mix[3]} × 3×
            </p>

            <button
              className="primary-button fb-save"
              onClick={save}
              disabled={selected.length !== size || saving || closed || loading}
            >
              {saving ? "Saving..." : editingId ? "Save changes →" : "Submit team →"}
            </button>

            {selected.length > 0 && (
              <button
                type="button"
                className="clear-selection"
                onClick={() => setSelected([])}
                disabled={saving || closed}
              >
                Clear roster
              </button>
            )}
          </section>

          <ScoringRules />
        </aside>
      </div>
    </AppLayout>
  );
}
