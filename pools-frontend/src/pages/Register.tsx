import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../api/auth";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const navigate=useNavigate(); const {login}=useAuth();
  const [formData,setFormData]=useState({username:"",first_name:"",email:"",password:"",confirmPassword:""});
  const [error,setError]=useState(""); const [loading,setLoading]=useState(false);
 
  const handleChange=(e:React.ChangeEvent<HTMLInputElement>)=>setFormData({...formData,[e.target.name]:e.target.value});
  
  const handleSubmit=async(e:React.FormEvent)=>{
    e.preventDefault();setError("");
    if(formData.password!==formData.confirmPassword){setError("Your passwords don't match.");return;}
    if(formData.password.length<8){setError("Use at least 8 characters for your password.");return;}
    try{setLoading(true);await registerUser({username:formData.username,first_name:formData.first_name,email:formData.email,password:formData.password});await login(formData.email,formData.password);navigate("/");}
    catch(err:any){const data=err.response?.data;setError(data?Object.entries(data).map(([k,v])=>`${k}: ${Array.isArray(v)?v.join(" "):String(v)}`).join(" "):"We couldn't create your account. Please try again.");}
    finally{setLoading(false);}
  };
  return <div className="auth-layout">
    <section className="auth-showcase"><div className="auth-brand"><span className="brand-mark">P</span> POOLSIDE</div>
      <div className="showcase-copy"><div className="eyebrow light-eyebrow"><span/> YOUR PEOPLE. YOUR POOL.</div><h1>Make every<br/><em>game matter.</em></h1><p>One place for your crew to compete, connect, and enjoy every game.</p></div>
      <div className="showcase-bottom"><div className="mini-avatars"><i>J</i><i>M</i><i>A</i><i>+</i></div><span>It’s more fun when you’re in.</span></div><div className="showcase-orb orb-one"/><div className="showcase-orb orb-two"/>
    </section>
    <section className="auth-panel"><div className="auth-form-wrap">
      <div className="mobile-auth-brand"><span className="brand-mark">P</span> POOLSIDE</div>
      <div className="form-kicker">GET IN THE GAME</div><h2>Create your account</h2><p className="auth-description">Set up your profile and start building your pools.</p>
      {error&&<div className="alert-error">{error}</div>}
      <form onSubmit={handleSubmit} className="auth-form">
        <label>First name<input name="first_name" value={formData.first_name} onChange={handleChange} placeholder="Your first name" required/></label>
        <label>Username<input name="username" value={formData.username} onChange={handleChange} placeholder="Choose a username" autoComplete="username" required/></label>
        <label>Email address<input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" autoComplete="email" required/></label>
        <div className="form-two"><label>Password<input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="8+ characters" autoComplete="new-password" required/></label><label>Confirm password<input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Repeat password" autoComplete="new-password" required/></label></div>
        <button className="primary-button auth-submit" disabled={loading}>{loading?"Creating account...":"Create account"} <span>→</span></button>
      </form>
      <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p><div className="auth-legal">By continuing, you agree to our Terms of Service and Privacy Policy.</div>
    </div></section>
  </div>;
}
