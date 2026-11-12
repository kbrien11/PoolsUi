import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getBoxes, claimBoxes } from "../api/boxes";
import { getPoolStatus, getLeaderboard } from "../api/pools";

import type { Box, PoolStatus } from "../types";

export default function PoolDetail() {
  const { poolId } = useParams();

  const id = Number(poolId);

  const [boxes, setBoxes] = useState<Box[]>([]);
  const [selectedBoxes, setSelectedBoxes] = useState<number[]>([]);
  const [status, setStatus] = useState<PoolStatus | null>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [error, setError] = useState("");

  const loadPool = async () => {
    try {
      const [boxData, statusData, leaderboardData] = await Promise.all([
        getBoxes(id),
        getPoolStatus(id),
        getLeaderboard(id),
      ]);

      setBoxes(boxData);
      setStatus(statusData);
      setLeaderboard(leaderboardData);
    } catch {
      setError("Unable to load this pool.");
    }
  };

  useEffect(() => {
    loadPool();
  }, [id]);

  const toggleBox = (box: Box) => {
    if (box.user_pk !== null) return;

    setSelectedBoxes((current) =>
      current.includes(box.id)
        ? current.filter((id) => id !== box.id)
        : [...current, box.id]
    );
  };

  const handleClaim = async () => {
    if (!selectedBoxes.length) return;

    try {
      await claimBoxes(id, selectedBoxes);
      setSelectedBoxes([]);
      await loadPool();
    } catch {
      setError("Unable to claim boxes. Some may already be taken.");
    }
  };

  return (
    <main className="page-container">
      <h1>Pool Details</h1>

      {error && <p className="error">{error}</p>}

      {status && (
        <div className="status-card">
          <p>Total boxes: {status.total_boxes}</p>
          <p>Claimed: {status.claimed_boxes}</p>
          <p>Remaining: {status.remaining_boxes}</p>
        </div>
      )}

      <h2>Select Your Boxes</h2>

      <div className="box-grid">
        {boxes.map((box) => {
          const claimed = box.user_pk !== null;
          const selected = selectedBoxes.includes(box.id);

          return (
            <button
              key={box.id}
              type="button"
              disabled={claimed}
              onClick={() => toggleBox(box)}
              className={[
                "box",
                claimed ? "claimed" : "",
                selected ? "selected" : "",
              ].join(" ")}
            >
              {box.pair}
              {claimed && <small>{box.username}</small>}
            </button>
          );
        })}
      </div>

      <div className="claim-section">
        <p>Selected boxes: {selectedBoxes.length}</p>

        <button
          onClick={handleClaim}
          disabled={selectedBoxes.length === 0}
        >
          Claim Selected Boxes
        </button>
      </div>

      <h2>Leaderboard</h2>

      {leaderboard.map((entry, index) => (
        <div key={entry.id}>
          {index + 1}. {entry.username} — ${entry.balance}
        </div>
      ))}
    </main>
  );
}