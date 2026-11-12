import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }

  return config;
});

// Append this to the bottom of src/api/fantasy.ts (it uses the `flatten` helper already in that file)

// Every error message from a failed request, for showing a list (e.g. bad rows in an upload)
export const apiErrors = (
  e: any,
  fallback = "Something went wrong. Please try again."
): string[] => {
  const messages = flatten(e?.response?.data);
  return messages.length ? messages.slice(0, 20) : [fallback];
};

export const createTournament = async (body: {
  name: string;
  year: number;
  lock_at: string | null;
  roster_size?: number;
}) => (await api.post<Tournament>("/fantasy/tournaments/", body)).data;

export const updateTournament = async (
  id: number,
  body: Partial<Pick<Tournament, "name" | "year" | "lock_at" | "roster_size" | "status">>
) => (await api.patch<Tournament>(`/fantasy/tournaments/${id}/`, body)).data;

export const deleteTournament = async (id: number) => {
  await api.delete(`/fantasy/tournaments/${id}/`);
};

export default api;

function flatten(data: any) {
  throw new Error("Function not implemented.");
}
