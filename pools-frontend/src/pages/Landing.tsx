import { Link } from "react-router-dom";


// Decorative preview board (not interactive)
const CLAIMED = [4, 5, 33, 58, 71];
const SELECTED = [12, 47, 68];

const STEPS = [
  {
    n: "01",
    title: "Join a pool",
    text: "Browse open pools and jump into the ones you like.",
  },
  {
    n: "02",
    title: "Pick your squares",
    text: "Choose any available squares on the 10 × 10 board.",
  },
  {
    n: "03",
    title: "Follow the leaderboard",
    text: "Watch the standings update as the games play out.",
  },
];

export default function Landing() {
  return (
    <div className="lp">
      {/* NAV */}
      <header className="lp-nav">
        <div className="lp-logo">
          POOL<span>SIDE</span>
        </div>

        <nav className="lp-nav-actions">
          <Link to="/login" className="lp-link">
            Sign in
          </Link>
          <Link to="/register" className="lp-btn lp-btn-small">
            Get started
          </Link>
        </nav>
      </header>

      {/* HERO */}
      <section className="lp-hero">
        <div className="lp-hero-copy">
          <div className="lp-eyebrow">
            <span /> SQUARES POOLS
          </div>

          <h1>
            Pick your squares.
            <br />
            Play the game.
          </h1>

          <p>
            Join a pool, claim your spots on the board, and follow along on
            the leaderboard. Simple, social, and made for game day.
          </p>

          <div className="lp-hero-actions">
            <Link to="/register" className="lp-btn">
              Create your account →
            </Link>
            <Link to="/login" className="lp-btn lp-btn-ghost">
              I already have an account
            </Link>
          </div>
        </div>

        <div className="lp-board-preview" aria-hidden="true">
          <div className="lp-board-grid">
            {Array.from({ length: 100 }, (_, i) => (
              <div
                key={i}
                className={`lp-cell ${
                  CLAIMED.includes(i) ? "claimed" : ""
                } ${SELECTED.includes(i) ? "selected" : ""}`}
              >
                {String(i).padStart(2, "0")}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="lp-steps">
        <div className="lp-eyebrow center">
          <span /> HOW IT WORKS
        </div>
        <h2>Three steps to get in the game</h2>

        <div className="lp-step-grid">
          {STEPS.map((s) => (
            <div className="lp-step" key={s.n}>
              <span className="lp-step-num">{s.n}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="lp-cta">
        <h2>Ready to grab your squares?</h2>
        <p>Open pools fill up fast. Jump in and claim yours.</p>
        <Link to="/register" className="lp-btn">
          Get started →
        </Link>
      </section>

      <footer className="lp-footer">
        © {new Date().getFullYear()} Poolside
      </footer>
    </div>
  );
}
