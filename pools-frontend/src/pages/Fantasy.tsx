// Place at src/api/fantasy.ts
import api from "../api/client"; // TODO: point this at your existing axios instance

export type Phase = "open" | "locked" | "complete";

export interface Tournament {
  id: number;
  name: string;
  year: number;
  status: Phase;
  phase: Phase;
  is_open: boolean;
  lock_at: string | null;
  roster_size: number;
  player_count: number;
  team_count: number;
}

export interface FantasyPlayer {
  id: number;
  external_id: string;
  name: string;
  school: string;
  seed: number;
  position: string;
  region: string;
  multiplier: 1 | 2 | 3;
  games_played: number;
  raw_points: number;
  total_points: number;
}

export interface FantasyTeam {
  id: number;
  name: string;
  username: string;
  tournament_id: number;
  tournament_name: string;
  is_mine: boolean;
  can_edit: boolean;
  total_points: number;
  players: FantasyPlayer[];
}

export interface LeaderboardRow {
  rank: number;
  team_id: number;
  team_name: string;
  username: string;
  first_name: string;
  total_points: number;
  is_mine: boolean;
}

export interface UploadResult {
  created: number;
  updated: number;
}

// ------------------------------------------------------------- error helper

const flatten = (d: unknown): string[] => {
  if (typeof d === "string") return d.length < 300 ? [d] : [];
  if (Array.isArray(d)) return d.flatMap(flatten);
  if (d && typeof d === "object") return Object.values(d as object).flatMap(flatten);
  return [];
};

export const apiError = (
  e: any,
  fallback = "Something went wrong. Please try again."
): string => {
  const messages = flatten(e?.response?.data);
  return messages.length ? messages.slice(0, 5).join(" ") : fallback;
};

// ---------------------------------------------------------------- endpoints

export const getTournaments = async () =>
  (await api.get<Tournament[]>("/fantasy/tournaments/")).data;

export const getTournament = async (id: number) =>
  (await api.get<Tournament>(`/fantasy/tournaments/${id}/`)).data;

export const setTournamentStatus = async (id: number, status: Phase) =>
  (await api.patch<Tournament>(`/fantasy/tournaments/${id}/`, { status })).data;

export const getFantasyPlayers = async (id: number) =>
  (await api.get<FantasyPlayer[]>(`/fantasy/tournaments/${id}/players/`)).data;

export const getMyTeams = async (id: number) =>
  (await api.get<FantasyTeam[]>(`/fantasy/tournaments/${id}/teams/`)).data;

export const getFantasyLeaderboard = async (id: number) =>
  (await api.get<LeaderboardRow[]>(`/fantasy/tournaments/${id}/leaderboard/`)).data;

export const getFantasyTeam = async (teamId: number) =>
  (await api.get<FantasyTeam>(`/fantasy/teams/${teamId}/`)).data;

export const createTeam = async (
  tournamentId: number,
  body: { name: string; player_ids: number[] }
) => (await api.post<FantasyTeam>(`/fantasy/tournaments/${tournamentId}/teams/`, body)).data;

export const updateTeam = async (
  teamId: number,
  body: { name: string; player_ids: number[] }
) => (await api.put<FantasyTeam>(`/fantasy/teams/${teamId}/`, body)).data;

export const deleteTeam = async (teamId: number) => {
  await api.delete(`/fantasy/teams/${teamId}/`);
};

const upload = async (path: string, file: File) => {
  const form = new FormData();
  form.append("file", file);
  return (
    await api.post<UploadResult>(path, form, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  ).data;
};

export const uploadPlayers = (id: number, file: File) =>
  upload(`/fantasy/tournaments/${id}/players/upload/`, file);

export const uploadStats = (id: number, file: File) =>
  upload(`/fantasy/tournaments/${id}/stats/upload/`, file);