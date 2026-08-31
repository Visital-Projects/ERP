import apiClient from "./apiClient";

const ENDPOINT = "/documents";

const getAll = () => apiClient.get(ENDPOINT);
const create = (data) => apiClient.post(ENDPOINT, data);
const update = (id, data) => apiClient.put(`${ENDPOINT}/${id}`, data);
const remove = (id) => apiClient.delete(`${ENDPOINT}/${id}`);

const documentService = { getAll, create, update, remove };
export default documentService;
