import api from "./client";
import type { Pool, PoolStatus } from "../types";

export const getPools = async (): Promise<Pool[]> => {
  const response = await api.get("/pools/");
  return response.data;
};

export const createPool = async (poolData: {
  name: string;
  type: "nfl" | "marchmadness";
  box_price: number;
  one?: number;
  two?: number;
  three?: number;
  four?: number;
  first_round?: number;
  second_round?: number;
  sweet_sixteen?: number;
  elite_eight?: number;
  final_four?: number;
  championship?: number;
}): Promise<any> => {
  const response = await api.post("/pools/", poolData);
  return response.data;
};

export const joinPool = async (code: number) => {
  const response = await api.post("/pools/join/", { code });
  return response.data;
};

export const getPoolStatus = async (
  poolId: number
): Promise<PoolStatus> => {
  const response = await api.get(`/pools/${poolId}/status/`);
  return response.data;
};

export const getLeaderboard = async (poolId: number) => {
  const response = await api.get(`/pools/${poolId}/leaderboard/`);
  return response.data;
};