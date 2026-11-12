import { useEffect,useState } from "react";
import { Link,useNavigate } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import { getPools,createPool,joinPool } from "../api/pools";
import { useAuth } from "../context/AuthContext";
import type { Pool } from "../types";

export default function Dashboard(){
 const {user}=useAuth();const navigate=useNavigate();
 const isAdmin=Boolean((user as {is_staff?:boolean}|null|undefined)?.is_staff);
 const [pools,setPools]=useState<Pool[]>([]);const [loading,setLoading]=useState(true);const [error,setError]=useState("");
 const [showCreate,setShowCreate]=useState(false);const [name,setName]=useState("");const [type,setType]=useState<"nfl"|"marchmadness">("nfl");const [price,setPrice]=useState("10");const [creating,setCreating]=useState(false);
 const [joinCode,setJoinCode]=useState("");const [joining,setJoining]=useState(false);
 const loadPools=async()=>{try{setPools(await getPools());}catch{setError("We couldn't load your pools. Please refresh and try again.");}finally{setLoading(false);}};
 useEffect(()=>{loadPools();},[]);
 const handleCreate=async(e:React.FormEvent)=>{e.preventDefault();setError("");try{setCreating(true);const result=await createPool({name,type,box_price:Number(price)});navigate(`/pools/${result.board.id}`);}catch{setError("Unable to create your pool. Please check the details and try again.");}finally{setCreating(false);}};
 const handleJoin=async(e:React.FormEvent)=>{e.preventDefault();setError("");try{setJoining(true);const result=await joinPool(Number(joinCode));const pool=result.board||result;const id=pool.id||pool.board_id;if(id)navigate(`/pools/${id}`);else{setError("Pool found, but the server did not return a pool ID.");}}catch{setError("We couldn't find a pool with that code.");}finally{setJoining(false);}};
 return <AppLayout><div className="page-heading"><div><div className="eyebrow"><span/> YOUR WORKSPACE</div><h1>Good to see you, {user?.first_name||user?.username||"there"}<span className="wave">✦</span></h1><p>Your pools, your people, and all the action in one place.</p></div><button className="primary-button" onClick={()=>setShowCreate(v=>!v)}><span className="plus">＋</span> Create a pool</button></div>
 {error&&<div className="alert-error dashboard-alert">{error}</div>}
 <div className="stat-grid">
  <div className="stat-card"><div className="stat-icon purple">▦</div><div className="stat-label">YOUR POOLS</div><div className="stat-value">{pools.length}</div><div className="stat-foot">Pools you manage or joined</div></div>
  <div className="stat-card"><div className="stat-icon green">♧</div><div className="stat-label">GAME FORMATS</div><div className="stat-value">{new Set(pools.map(p=>p.type)).size}</div><div className="stat-foot">Ways to play</div></div>
  <div className="stat-card"><div className="stat-icon orange">◎</div><div className="stat-label">POOL STATUS</div><div className="stat-value">{pools.length?"Ready":"Let's play"}</div><div className="stat-foot">Your next game starts here</div></div>
 </div>
 {showCreate&&<section className="panel create-panel"><div className="panel-heading"><div><div className="eyebrow">START SOMETHING</div><h2>Create a new pool</h2><p>Set up a pool and invite your crew to join.</p></div><button className="icon-button" onClick={()=>setShowCreate(false)}>×</button></div><form className="create-form" onSubmit={handleCreate}>
  <label>Pool name<input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Sunday Football Crew" required/></label>
  <div className="form-two"><label>Game format<select value={type} onChange={e=>setType(e.target.value as "nfl"|"marchmadness")}><option value="nfl">NFL Squares</option><option value="marchmadness">March Madness</option></select></label><label>Price per square<input type="number" min="0" step="0.01" value={price} onChange={e=>setPrice(e.target.value)} required/></label></div>
  <div className="form-actions"><button type="button" className="secondary-button" onClick={()=>setShowCreate(false)}>Cancel</button><button className="primary-button" disabled={creating}>{creating?"Creating...":"Create pool →"}</button></div>
 </form></section>}
 <div className="section-heading"><div><h2>Your pools</h2><p>Jump back into the action.</p></div><span className="count-pill">{pools.length} {pools.length===1?"pool":"pools"}</span></div>
 {loading?<div className="pool-grid">{[1,2,3].map(x=><div className="skeleton-card" key={x}/>)}</div>:pools.length===0?<div className="empty-state"><div className="empty-art"><span>▦</span><i>✦</i></div><h3>Your next favorite tradition starts here.</h3><p>Create your first pool or join one with an invite code.</p><button className="primary-button" onClick={()=>setShowCreate(true)}>Create your first pool <span>→</span></button></div>:<div className="pool-grid">{pools.map((pool,index)=><Link to={`/pools/${pool.id}`} className="pool-card-modern" key={pool.id}><div className={`pool-art art-${index%3}`}><span className="art-label">{pool.type==="nfl"?"NFL SQUARES":"MARCH MADNESS"}</span><span className="art-glyph">{pool.type==="nfl"?"🏈":"🏀"}</span><div className="art-orbit"/></div><div className="pool-card-body"><div className="pool-card-top"><span className="status-tag"><i/> ACTIVE POOL</span><span className="card-arrow">↗</span></div><h3>{pool.name}</h3><div className="pool-meta"><span>◈ Code <strong>{pool.code}</strong></span><span>◉ ${pool.box_price} / square</span></div><div className="pool-card-bottom"><span>Open pool</span><span>View details →</span></div></div></Link>)}</div>}
 <section className="join-strip"><div className="join-symbol">🏀</div><div className="join-copy"><strong>March Madness Fantasy</strong><span>Pick any 10 players. Lower seeds score more. Highest total wins.</span></div><div style={{display:"flex",gap:10,flexWrap:"wrap"}}><button type="button" className="dark-button" onClick={()=>navigate("/fantasy")}>Play fantasy →</button>{isAdmin&&<button type="button" className="primary-button" onClick={()=>navigate("/fantasy/new")}>+ New tournament</button>}</div></section>
 <section className="join-strip"><div className="join-symbol">↗</div><div className="join-copy"><strong>Have an invite code?</strong><span>Join a pool your friends have already created.</span></div><form onSubmit={handleJoin}><input type="number" value={joinCode} onChange={e=>setJoinCode(e.target.value)} placeholder="Enter pool code" required/><button className="dark-button" disabled={joining}>{joining?"Joining...":"Join pool →"}</button></form></section>
 </AppLayout>;
}
