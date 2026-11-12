import { createContext, useContext, useState, type ReactNode } from "react";
import { loginUser, logoutUser } from "../api/auth";
import type { User } from "../types";
interface AuthContextType { user: User | null; isAuthenticated: boolean; login: (email: string, password: string) => Promise<void>; logout: () => Promise<void> }
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(() => { try { const raw = localStorage.getItem("user"); return raw ? JSON.parse(raw) : null; } catch { return null; } });
    const login = async (email: string, password: string) => { const data = await loginUser(email, password); localStorage.setItem("token", data.token); localStorage.setItem("user", JSON.stringify(data.user)); setUser(data.user); };
    const logout = async () => { try { await logoutUser(); } finally { localStorage.removeItem("token"); localStorage.removeItem("user"); setUser(null); } };
    return <AuthContext.Provider value={{ user, isAuthenticated: !!user && !!localStorage.getItem("token"), login, logout }}>{children}</AuthContext.Provider>;
}
export function useAuth() { const value = useContext(AuthContext); if (!value) throw new Error("useAuth must be used inside AuthProvider"); return value; }
