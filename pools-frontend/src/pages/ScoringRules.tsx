// Place at src/components/ScoringRules.tsx
import "../pages/fantasy.css";

export default function ScoringRules() {
  return (
    <section className="panel aside-panel">
      <div className="eyebrow">HOW SCORING WORKS</div>
      <h3>Seed multipliers</h3>

      <div className="fb-rule">
        <span className="fb-mult m1">1×</span>
        <div>
          <strong>Seeds 1–5</strong>
          <small>10 points scored = 10 points</small>
        </div>
      </div>

      <div className="fb-rule">
        <span className="fb-mult m2">2×</span>
        <div>
          <strong>Seeds 6–11</strong>
          <small>10 points scored = 20 points</small>
        </div>
      </div>

      <div className="fb-rule">
        <span className="fb-mult m3">3×</span>
        <div>
          <strong>Seeds 12–16</strong>
          <small>10 points scored = 30 points</small>
        </div>
      </div>

      <p className="fb-rule-note">
        Pick any 10 players. Every point they score in the tournament is
        multiplied by their school's seed tier. The team with the most total
        points wins. Submit as many teams as you like.
      </p>
    </section>
  );
}
