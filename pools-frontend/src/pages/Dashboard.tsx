import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { getPools, createPool } from "../api/pools";
import { useAuth } from "../context/AuthContext";
import type { Pool } from "../types";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [pools, setPools] = useState<Pool[]>([]);
  const [name, setName] = useState("");
  const [type, setType] = useState<"nfl" | "marchmadness">("nfl");
  const [boxPrice, setBoxPrice] = useState("10");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPools = async () => {
    try {
      const data = await getPools();
      setPools(data);
    } catch {
      setError("Unable to load your pools.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPools();
  }, []);

  const handleCreatePool = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const result = await createPool({
        name,
        type,
        box_price: Number(boxPrice),
      });

      navigate(`/pools/${result.board.id}`);
    } catch {
      setError("Unable to create pool. Check your information.");
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <main className="page-container">
      <header className="navbar">
        <h2>Pool Central</h2>

        <div>
          <span>{user?.first_name || user?.username}</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <section>
        <h1>My Pools</h1>
        <p>Create a pool or manage your existing pools.</p>

        {error && <p className="error">{error}</p>}

        {loading ? (
          <p>Loading pools...</p>
        ) : pools.length === 0 ? (
          <p>You haven't created or joined any pools yet.</p>
        ) : (
          <div className="pool-grid">
            {pools.map((pool) => (
              <Link
                to={`/pools/${pool.id}`}
                className="pool-card"
                key={pool.id}
              >
                <h3>{pool.name}</h3>
                <p>{pool.type.toUpperCase()}</p>
                <p>${pool.box_price} per box</p>
                <p>Code: {pool.code}</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="create-pool">
        <h2>Create a Pool</h2>

        <form onSubmit={handleCreatePool}>
          <input
            placeholder="Pool name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <select
            value={type}
            onChange={(e) =>
              setType(e.target.value as "nfl" | "marchmadness")
            }
          >
            <option value="nfl">NFL</option>
            <option value="marchmadness">March Madness</option>
          </select>

          <input
            type="number"
            min="0"
            step="0.01"
            value={boxPrice}
            onChange={(e) => setBoxPrice(e.target.value)}
            required
          />

          <button type="submit">Create Pool</button>
        </form>
      </section>
    </main>
  );
}