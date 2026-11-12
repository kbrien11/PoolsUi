import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [error,setError] = useState("");
  const [loading,setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    try { setLoading(true); await login(email,password); navigate("/dashboard"); }
    catch { setError("We couldn't sign you in. Check your email and password."); }
    finally { setLoading(false); }
  };

  return <div className="auth-layout">
    <section className="auth-showcase">
      <div className="auth-brand"><span className="brand-mark">P</span> POOLSIDE</div>
      <div className="showcase-copy"><div className="eyebrow light-eyebrow"><span/> THE GAME STARTS HERE</div>
        <h1>Every game is<br/><em>better together.</em></h1>
        <p>Create a pool, bring your people together, and make every moment count.</p>
      </div>
      <div className="showcase-bottom"><div className="mini-avatars"><i>J</i><i>M</i><i>A</i><i>+</i></div><span>Your crew. Your pool. Your game.</span></div>
      <div className="showcase-orb orb-one"/><div className="showcase-orb orb-two"/>
    </section>
    <section className="auth-panel"><div className="auth-form-wrap">
      <div className="mobile-auth-brand"><span className="brand-mark">P</span> POOLSIDE</div>
      <div className="form-kicker">WELCOME BACK</div><h2>Sign in to Poolside</h2><p className="auth-description">Pick up right where the action left off.</p>
      {error && <div className="alert-error">{error}</div>}
      <form onSubmit={handleSubmit} className="auth-form">
        <label>Email address<input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" required/></label>
        <label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter your password" autoComplete="current-password" required/></label>
        <button className="primary-button auth-submit" disabled={loading}>{loading?"Signing in...":"Sign in"} <span>→</span></button>
      </form>
      <p className="auth-switch">New to Poolside? <Link to="/register">Create an account</Link></p>
      <div className="auth-legal">By continuing, you agree to our Terms of Service and Privacy Policy.</div>
    </div></section>
  </div>;
}
