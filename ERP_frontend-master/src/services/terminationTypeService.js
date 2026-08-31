import apiClient from "./apiClient";

const ENDPOINT = "/termination-types";

export const getTerminationTypes = async () => {
  const res = await apiClient.get(ENDPOINT);
  return res.data; // returns { success, data }
};

export const createTerminationType = async (data) => {
  const res = await apiClient.post(ENDPOINT, data);
  return res.data;
};

export const updateTerminationType = async (id, data) => {
  const res = await apiClient.put(`${ENDPOINT}/${id}`, data);
  return res.data;
};

export const deleteTerminationType = async (id) => {
  const res = await apiClient.delete(`${ENDPOINT}/${id}`);
  return res.data;
};
