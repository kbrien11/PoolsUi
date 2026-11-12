import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import { getBoxes, claimBoxes } from "../api/boxes";
import { getPoolStatus, getLeaderboard } from "../api/pools";
// TODO: adjust this import to match how your app exposes the logged-in user
import { useAuth } from "../context/AuthContext";
import type { Box, PoolStatus } from "../types";

export default function PoolDetail() {
  const { poolId } = useParams();
  const id = Number(poolId);

  // TODO: adjust to match your auth setup. Needs the current user's id,
  // which should match `box.user_pk` on claimed boxes.
  const { user } = useAuth();
  const myId = user?.id;

  const [boxes, setBoxes] = useState<Box[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [status, setStatus] = useState<PoolStatus | null>(null);
  const [leaders, setLeaders] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = async () => {
    try {
      setError("");

      const [b, s, l] = await Promise.all([
        getBoxes(id),
        getPoolStatus(id),
        getLeaderboard(id),
      ]);

      // Keep the grid in a stable order regardless of claim status,
      // so claimed squares stay in their normal spots.
      const ordered = [...b].sort((x, y) =>
        String(x.pair).localeCompare(String(y.pair), undefined, {
          numeric: true,
        })
      );

      setBoxes(ordered);
      setStatus(s);
      setLeaders(Array.isArray(l) ? l : []);
    } catch {
      setError(
        "We couldn't load this pool. You may need to join it before viewing the board."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (Number.isFinite(id) && id > 0) {
      load();
    }
  }, [id]);

  // Select or deselect a square.
  const toggle = (box: Box) => {
    if (box.user_pk !== null || claiming) return;

    setSelected((current) =>
      current.includes(box.id)
        ? current.filter((x) => x !== box.id)
        : [...current, box.id]
    );
  };

  // Claim selected squares.
  const claim = async () => {
    if (!selected.length) return;

    try {
      setClaiming(true);
      setError("");

      const claimedCount = selected.length;

      await claimBoxes(id, selected);

      setSelected([]);

      setNotice(
        `${claimedCount} ${
          claimedCount === 1 ? "square" : "squares"
        } claimed successfully.`
      );

      await load();
    } catch {
      setError(
        "Some selected squares may have been claimed by someone else. Refresh and try again."
      );
    } finally {
      setClaiming(false);
    }
  };

  const money = (v: string | number | undefined) =>
    `$${Number(v || 0).toFixed(2)}`;

  // Squares currently selected (not yet claimed).
  const selectedBoxes = boxes
    .filter((box) => selected.includes(box.id))
    .sort((a, b) =>
      String(a.pair).localeCompare(String(b.pair), undefined, {
        numeric: true,
      })
    );

  // Squares already claimed by the current user.
  const myClaimedBoxes = boxes.filter(
    (box) => box.user_pk !== null && box.user_pk === myId
  );

  const selectedValue =
    selected.length * Number(boxes[0]?.balance || 0);

  return (
    <AppLayout>
      <div className="detail-back">
        <Link to="/">← Back to all pools</Link>
      </div>

      <div className="detail-heading">
        <div>
          <div className="eyebrow">
            <span /> POOL BOARD
          </div>

          <h1>Pool details</h1>

          <p>Choose your squares and follow the leaderboard.</p>
        </div>

        <span className="pool-type-pill">
          ▦ &nbsp; 10 × 10 SQUARES
        </span>
      </div>

      {error && (
        <div className="alert-error dashboard-alert">
          {error}
        </div>
      )}

      {notice && (
        <div className="alert-success">
          {notice}
          <button onClick={() => setNotice("")}>×</button>
        </div>
      )}

      {/* POOL STATISTICS */}
      <div className="detail-stats">
        <div className="detail-stat">
          <span>AVAILABLE SQUARES</span>
          <strong>{status?.remaining_boxes ?? "—"}</strong>
          <small>Ready to claim</small>
        </div>

        <div className="detail-stat">
          <span>CLAIMED SQUARES</span>
          <strong>{status?.claimed_boxes ?? "—"}</strong>
          <small>Already taken</small>
        </div>

        <div className="detail-stat">
          <span>BOARD CAPACITY</span>
          <strong>{status?.total_boxes ?? 100}</strong>
          <small>Total squares</small>
        </div>

        <div className="detail-stat">
          <span>YOUR SELECTION</span>
          <strong className="selection-number">
            {selected.length}
          </strong>
          <small>{money(selectedValue)} selected value</small>
        </div>
      </div>

      <div className="detail-layout">
        {/* MAIN BOARD */}
        <section className="panel board-panel">
          <div className="panel-heading board-heading">
            <div>
              <div className="eyebrow">THE BOARD</div>
              <h2>Pick your squares</h2>
              <p>Select any available square below.</p>
            </div>

            <div className="board-legend">
              <span>
                <i className="legend-open" /> Available
              </span>

              <span>
                <i className="legend-selected" /> Selected
              </span>

              <span>
                <i className="legend-taken" /> Claimed
              </span>
            </div>
          </div>

          {loading ? (
            <div className="board-loading">
              Loading your board...
            </div>
          ) : (
            <div className="board-scroll">
              <div className="box-grid-modern">
                {/* Render every box returned by the API, in order. */}
                {boxes.map((box) => {
                  const taken = box.user_pk !== null;
                  const active = selected.includes(box.id);
                  const mine = taken && box.user_pk === myId;

                  return (
                    <button
                      key={box.id}
                      type="button"
                      disabled={taken || claiming}
                      onClick={() => toggle(box)}
                      className={`square ${taken ? "taken" : ""} ${
                        mine ? "mine" : ""
                      } ${active ? "chosen" : ""}`}
                      title={
                        taken
                          ? `Claimed by ${box.username}`
                          : active
                          ? `Deselect square ${box.pair}`
                          : `Select square ${box.pair}`
                      }
                      aria-pressed={active}
                    >
                      <strong>{box.pair}</strong>

                      {taken && (
                        <small>
                          {box.first_name || box.username}
                        </small>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* CLAIM BUTTON */}
          <div className="claim-bar">
            <button
              className="primary-button"
              onClick={claim}
              disabled={
                !selected.length || claiming || loading
              }
            >
              {claiming
                ? "Claiming..."
                : `Claim ${selected.length || ""} ${
                    selected.length === 1 ? "square" : "squares"
                  } →`}
            </button>
          </div>
        </section>

        {/* RIGHT SIDEBAR */}
        <aside className="detail-aside">
          {/* YOUR PICKS: pending selections + your claimed squares */}
          <section className="panel aside-panel selected-panel">
            <div className="eyebrow">YOUR PICKS</div>

            <h3>
              Your Squares ({selected.length + myClaimedBoxes.length})
            </h3>

            {selected.length === 0 && myClaimedBoxes.length === 0 ? (
              <p className="muted-empty">
                Select squares on the board to see them here.
              </p>
            ) : (
              <>
                {selected.length > 0 && (
                  <>
                    <div className="selected-summary">
                      <strong>{selected.length} selected</strong>
                      <span>{money(selectedValue)}</span>
                    </div>

                    <div className="selected-box-list">
                      {selectedBoxes.map((box) => (
                        <div
                          className="selected-box-item"
                          key={box.id}
                        >
                          <span className="selected-box-number">
                            {box.pair}
                          </span>

                          <button
                            type="button"
                            onClick={() => toggle(box)}
                            disabled={claiming}
                            aria-label={`Remove square ${box.pair}`}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      className="clear-selection"
                      onClick={() => setSelected([])}
                      disabled={claiming}
                    >
                      Clear all selections
                    </button>
                  </>
                )}

                {myClaimedBoxes.length > 0 && (
                  <>
                    <div className="selected-summary">
                      <strong>{myClaimedBoxes.length} claimed</strong>
                    </div>

                    <div className="selected-box-list">
                      {myClaimedBoxes.map((box) => (
                        <div
                          className="selected-box-item claimed"
                          key={box.id}
                        >
                          <span className="selected-box-number">
                            {box.pair}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </section>

          {/* POOL SNAPSHOT */}
          <section className="panel aside-panel">
            <div className="eyebrow">POOL SNAPSHOT</div>

            <h3>Board activity</h3>

            <div className="progress-copy">
              <span>Squares claimed</span>

              <strong>
                {status?.total_boxes
                  ? Math.round(
                      (status.claimed_boxes / status.total_boxes) * 100
                    )
                  : 0}
                %
              </strong>
            </div>

            <div className="progress-track">
              <div
                style={{
                  width: `${
                    status?.total_boxes
                      ? (status.claimed_boxes / status.total_boxes) * 100
                      : 0
                  }%`,
                }}
              />
            </div>

            <div className="activity-line">
              <span>Available</span>
              <strong>{status?.remaining_boxes ?? "—"}</strong>
            </div>

            <div className="activity-line">
              <span>Claimed</span>
              <strong>{status?.claimed_boxes ?? "—"}</strong>
            </div>
          </section>

          {/* LEADERBOARD */}
          <section className="panel aside-panel">
            <div className="eyebrow">TOP PLAYERS</div>

            <h3>Leaderboard</h3>

            {leaders.length === 0 ? (
              <p className="muted-empty">
                No leaderboard results yet. Check back once the games begin.
              </p>
            ) : (
              <div className="leader-list">
                {leaders.slice(0, 5).map((entry, index) => (
                  <div
                    className="leader-row"
                    key={entry.id || index}
                  >
                    <span className={`rank rank-${index + 1}`}>
                      {index + 1}
                    </span>

                    <span className="leader-avatar">
                      {String(
                        entry.first_name || entry.username || "?"
                      )
                        .slice(0, 1)
                        .toUpperCase()}
                    </span>

                    <span className="leader-name">
                      {entry.first_name || entry.username}
                    </span>

                    <strong>{money(entry.balance)}</strong>
                  </div>
                ))}
              </div>
            )}
          </section>
        </aside>
      </div>
    </AppLayout>
  );
}
