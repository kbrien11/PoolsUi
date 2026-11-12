import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import PoolDetail from "./pages/PoolDetail";
import FantasyHome from "./pages/FantasyHome";

import CreateTournament from "./pages/CreateTournament";
import TeamBuilder from "./pages/TeamBuilder";
import TeamDetail from "./pages/TeamDetail";
import FantasyTournament from "./pages/Fantasytournament";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/pools/:poolId" element={<PoolDetail />} />

            {/* March Madness Fantasy */}
            <Route path="/fantasy" element={<FantasyHome />} />
            <Route path="/fantasy/new" element={<CreateTournament />} />
            <Route path="/fantasy/:tournamentId" element={<FantasyTournament />} />
            <Route path="/fantasy/:tournamentId/teams/new" element={<TeamBuilder />} />
            <Route path="/fantasy/:tournamentId/teams/:teamId/edit" element={<TeamBuilder />} />
            <Route path="/fantasy/teams/:teamId" element={<TeamDetail />} />
          </Route>

          {/* Anything else goes back to the landing page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;