// Place at src/components/TournamentCreateForm.tsx
import { useState } from "react";
import type { FormEvent } from "react";
import { apiError, createTournament } from "../api/client";
import type { Tournament } from "../pages/Fantasy";


// March Madness is in March: from July on, default to next year.
const defaultYear = () => {
  const now = new Date();
  return now.getMonth() >= 6 ? now.getFullYear() + 1 : now.getFullYear();
};

export default function TournamentCreateForm({
  onCreated,
}: {
  onCreated: (tournament: Tournament) => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [year, setYear] = useState(defaultYear());
  const [lockAt, setLockAt] = useState("");
  const [rosterSize, setRosterSize] = useState(10);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError("");

      const tournament = await createTournament({
        name: name.trim() || `March Madness ${year}`,
        year,
        // datetime-local gives local time with no zone; convert to a real timestamp
        lock_at: lockAt ? new Date(lockAt).toISOString() : null,
        roster_size: rosterSize,
      });

      onCreated(tournament);
    } catch (err) {
      setError(apiError(err, "We couldn't create the tournament."));
      setSaving(false);
    }
  };

  if (!open) {
    return (
      <button type="button" className="primary-button fa-new-button" onClick={() => setOpen(true)}>
        + New tournament
      </button>
    );
  }

  return (
    <form className="panel fa-form" onSubmit={submit}>
      <div className="eyebrow">ADMIN</div>
      <h3>New tournament</h3>

      {error && <div className="alert-error">{error}</div>}

      <div className="fa-form-grid">
        <label>
          <span>Name</span>
          <input
            type="text"
            placeholder={`March Madness ${year}`}
            value={name}
            maxLength={120}
            onChange={(e) => setName(e.target.value)}
          />
        </label>

        <label>
          <span>Year</span>
          <input
            type="number"
            min={2000}
            max={2100}
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            required
          />
        </label>

        <label>
          <span>Entries close (optional)</span>
          <input type="datetime-local" value={lockAt} onChange={(e) => setLockAt(e.target.value)} />
        </label>

        <label>
          <span>Players per team</span>
          <input
            type="number"
            min={1}
            max={30}
            value={rosterSize}
            onChange={(e) => setRosterSize(Number(e.target.value))}
            required
          />
        </label>
      </div>

      <div className="fa-form-actions">
        <button className="primary-button" type="submit" disabled={saving}>
          {saving ? "Creating..." : "Create tournament →"}
        </button>
        <button type="button" className="fa-ghost" onClick={() => setOpen(false)} disabled={saving}>
          Cancel
        </button>
      </div>
    </form>
  );
}
