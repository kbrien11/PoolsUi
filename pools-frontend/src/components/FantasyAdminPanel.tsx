// Place at src/components/FantasyAdminPanel.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  apiError,

  getFantasyPlayers,
 
  uploadPlayers,
  uploadStats,
} from "../pages/Fantasy"
import type { FantasyPlayer, Phase, Tournament, UploadResult } from "../pages/Fantasy"


const PLAYER_TEMPLATE = {
  players: [
    { external_id: "duke-001", name: "Player One", school: "Duke", seed: 1, position: "G", region: "East" },
    { external_id: "duke-002", name: "Player Two", school: "Duke", seed: 1, position: "F", region: "East" },
  ],
};

const STATS_TEMPLATE = {
  games: [
    { external_id: "duke-001", round: "Round of 64", points: 18 },
    { external_id: "duke-001", round: "Round of 32", points: 22 },
  ],
};

const PHASE_LABEL: Record<Phase, string> = {
  open: "Open",
  locked: "Locked",
  complete: "Complete",
};

const download = (filename: string, data: unknown) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

// ISO timestamp -> value for <input type="datetime-local"> in the viewer's time zone
const toLocalInput = (iso: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}`;
};

// ------------------------------------------------------------- upload card

function UploadCard({
  step,
  title,
  hint,
  rowKey,
  template,
  templateName,
  disabled,
  disabledReason,
  onUpload,
}: {
  step: number;
  title: string;
  hint: string;
  rowKey: "players" | "games";
  template: unknown;
  templateName: string;
  disabled?: boolean;
  disabledReason?: string;
  onUpload: (file: File) => Promise<UploadResult>;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [count, setCount] = useState(0);
  const [problem, setProblem] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [busy, setBusy] = useState(false);

  const clear = () => {
    setFile(null);
    setCount(0);
    setProblem("");
    setErrors([]);
  };

  // Read the file in the browser first so the admin can see what they're about to upload.
  const pick = async (picked?: File) => {
    clear();
    setResult(null);
    if (!picked) return;

    try {
      const parsed = JSON.parse(await picked.text());
      const rows = Array.isArray(parsed) ? parsed : parsed?.[rowKey];
      if (!Array.isArray(rows) || rows.length === 0) throw new Error("empty");
      setFile(picked);
      setCount(rows.length);
    } catch {
      setProblem(`That file isn't valid JSON with a non-empty "${rowKey}" list.`);
    }
  };

  const submit = async () => {
    if (!file) return;
    try {
      setBusy(true);
      setErrors([]);
      const r = await onUpload(file);
      setResult(r);
      setFile(null);
      setCount(0);
    } catch (e) {
      setErrors(apiErrors(e, "That upload failed."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`fa-card ${disabled ? "disabled" : ""}`}>
      <div className="fa-card-head">
        <span className="fa-step">{step}</span>
        <div className="fa-card-title">
          <strong>{title}</strong>
          <small>{hint}</small>
        </div>
        <button type="button" className="fa-link" onClick={() => download(templateName, template)}>
          Download template
        </button>
      </div>

      {disabled && disabledReason && <p className="fa-muted">{disabledReason}</p>}

      {!disabled && !file && (
        <label className="fa-drop">
          <span>Choose a JSON file</span>
          <input
            type="file"
            accept=".json,application/json"
            onChange={(e) => {
              const picked = e.target.files?.[0];
              e.target.value = "";
              pick(picked);
            }}
          />
        </label>
      )}

      {file && (
        <div className="fa-ready">
          <span>
            <strong>{count}</strong> {rowKey === "players" ? "players" : "game rows"} ready in{" "}
            <em>{file.name}</em>
          </span>
          <div className="fa-ready-actions">
            <button type="button" className="primary-button" onClick={submit} disabled={busy}>
              {busy ? "Uploading..." : "Upload"}
            </button>
            <button type="button" className="fa-ghost" onClick={clear} disabled={busy}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {problem && <div className="alert-error">{problem}</div>}

      {errors.length > 0 && (
        <div className="alert-error">
          <strong>Nothing was uploaded. Fix these and try again:</strong>
          <ul className="fa-errors">
            {errors.map((msg, i) => (
              <li key={i}>{msg}</li>
            ))}
          </ul>
        </div>
      )}

      {result && (
        <div className="alert-success">
          Done: {result.created} new, {result.updated} updated.
          <button type="button" onClick={() => setResult(null)}>
            ×
          </button>
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------------- panel

export default function FantasyAdminPanel({
  tournament,
  onChanged,
  onNotice,
}: {
  tournament: Tournament;
  onChanged: () => Promise<void> | void;
  onNotice: (message: string) => void;
}) {
  const navigate = useNavigate();
  const id = tournament.id;

  const [players, setPlayers] = useState<FantasyPlayer[]>([]);
  const [lockAt, setLockAt] = useState(toLocalInput(tournament.lock_at));
  const [working, setWorking] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setLockAt(toLocalInput(tournament.lock_at));
  }, [tournament.lock_at]);

  const loadPlayers = () =>
    getFantasyPlayers(id)
      .then(setPlayers)
      .catch(() => setPlayers([]));

  useEffect(() => {
    loadPlayers();
  }, [id, tournament.player_count]);

  const tiers = useMemo(() => {
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0 };
    players.forEach((p) => (counts[p.multiplier] += 1));
    return counts;
  }, [players]);

  const handlePlayers = async (file: File) => {
    const result = await uploadPlayers(id, file);
    await onChanged();
    await loadPlayers();
    return result;
  };

  const handleStats = async (file: File) => {
    const result = await uploadStats(id, file);
    await onChanged();
    await loadPlayers();
    return result;
  };

  const run = async (label: string, action: () => Promise<unknown>, notice: string) => {
    try {
      setWorking(label);
      setError("");
      await action();
      await onChanged();
      onNotice(notice);
    } catch (e) {
      setError(apiError(e));
    } finally {
      setWorking("");
    }
  };

  const remove = async () => {
    if (
      !window.confirm(
        `Delete "${tournament.name}"? This permanently removes its players, game stats and every submitted team.`
      )
    )
      return;

    try {
      setWorking("delete");
      await deleteTournament(id);
      navigate("/fantasy");
    } catch (e) {
      setError(apiError(e));
      setWorking("");
    }
  };

  return (
    <div className="fa-panel">
      {error && <div className="alert-error">{error}</div>}

      <h3>Load data</h3>

      <UploadCard
        step={1}
        title="Player list"
        hint="Every player eligible for the tournament, with their school's seed."
        rowKey="players"
        template={PLAYER_TEMPLATE}
        templateName="players-template.json"
        onUpload={handlePlayers}
      />

      <UploadCard
        step={2}
        title="Game stats"
        hint="Points per player per game. Upload again as rounds finish."
        rowKey="games"
        template={STATS_TEMPLATE}
        templateName="game-stats-template.json"
        disabled={tournament.player_count === 0}
        disabledReason="Upload the player list first. Stats are matched to players by external_id."
        onUpload={handleStats}
      />

      <h3>Loaded players</h3>

      {players.length === 0 ? (
        <p className="fa-muted">No players loaded yet.</p>
      ) : (
        <>
          <p className="fa-summary">
            <strong>{players.length}</strong> players &nbsp;·&nbsp; {tiers[1]} at 1× &nbsp;·&nbsp;{" "}
            {tiers[2]} at 2× &nbsp;·&nbsp; {tiers[3]} at 3×
          </p>

          <div className="fb-table-wrap">
            <table className="fb-table">
              <thead>
                <tr>
                  <th>Seed</th>
                  <th>Player</th>
                  <th>School</th>
                  <th>Mult.</th>
                  <th className="num">Games</th>
                  <th className="num">Points</th>
                </tr>
              </thead>
              <tbody>
                {players.slice(0, 8).map((p) => (
                  <tr key={p.id}>
                    <td>{p.seed}</td>
                    <td>{p.name}</td>
                    <td>{p.school}</td>
                    <td>
                      <span className={`fb-mult m${p.multiplier}`}>{p.multiplier}×</span>
                    </td>
                    <td className="num">{p.games_played}</td>
                    <td className="num">{p.raw_points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {players.length > 8 && <p className="fa-muted">…and {players.length - 8} more.</p>}
        </>
      )}

      <h3>Tournament settings</h3>

      <div className="fa-setting">
        <span className="fa-label">Status</span>
        <div className="fb-status-buttons">
          {(["open", "locked", "complete"] as Phase[]).map((s) => (
            <button
              key={s}
              type="button"
              className={tournament.status === s ? "active" : ""}
              disabled={working === "status"}
              onClick={() =>
                run(
                  "status",
                  () => updateTournament(id, { status: s }),
                  `Tournament marked ${PHASE_LABEL[s].toLowerCase()}.`
                )
              }
            >
              {PHASE_LABEL[s]}
            </button>
          ))}
        </div>
        <small className="fa-muted">
          Locked or complete stops anyone from creating or changing teams.
        </small>
      </div>

      <div className="fa-setting">
        <span className="fa-label">Entries close at</span>
        <div className="fa-inline">
          <input type="datetime-local" value={lockAt} onChange={(e) => setLockAt(e.target.value)} />
          <button
            type="button"
            className="fa-ghost"
            disabled={working === "lock"}
            onClick={() =>
              run(
                "lock",
                () =>
                  updateTournament(id, {
                    lock_at: lockAt ? new Date(lockAt).toISOString() : null,
                  }),
                lockAt ? "Close time saved." : "Close time cleared."
              )
            }
          >
            Save
          </button>
        </div>
        <small className="fa-muted">
          Teams lock automatically at this time. Leave it blank to lock manually.
        </small>
      </div>

      <div className="fa-danger">
        <div>
          <strong>Delete tournament</strong>
          <small>Removes its players, stats and all submitted teams. This can't be undone.</small>
        </div>
        <button type="button" onClick={remove} disabled={working === "delete"}>
          {working === "delete" ? "Deleting..." : "Delete"}
        </button>
      </div>
    </div>
  );
}
