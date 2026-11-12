
import api from "./client";
import type { AuthResponse } from "../types";

export const registerUser = async (userData: {
  username: string;
  first_name: string;
  email: string;
  password: string;
}): Promise<AuthResponse> => {
  const response = await api.post("/auth/register/", userData);
  return response.data;
};

export const loginUser = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  const response = await api.post("/auth/login/", {
    email,
    password,
  });
  return response.data;
};

export const logoutUser = async (): Promise<void> => {
  await api.post("/auth/logout/");
};
