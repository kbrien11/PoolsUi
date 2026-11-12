import api from "./client";
import type { Box } from "../types";

export const getBoxes = async (poolId: number): Promise<Box[]> => {
  const response = await api.get(`/pools/${poolId}/boxes/`);
  return response.data;
};

export const claimBoxes = async (
  poolId: number,
  boxIds: number[]
) => {
  const response = await api.post(
    `/pools/${poolId}/boxes/claim/`,
    {
      box_ids: boxIds,
    }
  );

  return response.data;
};

export const getRemainingBoxes = async (poolId: number) => {
  const response = await api.get(
    `/pools/${poolId}/boxes/remaining/`
  );

  return response.data;
};