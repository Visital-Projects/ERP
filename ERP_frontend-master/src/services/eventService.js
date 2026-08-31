import apiClient from "./apiClient";

export const getEvents = async () => {
  try {
    const res = await apiClient.get("/events");
    return res.data;
  } catch (error) {
    console.error("Failed to fetch events:", error);
    return [];
  }
};

export const createEvent = async (data) => {
  try {
    const res = await apiClient.post("/events", data);
    return res.data;
  } catch (error) {
    console.error("Failed to create event:", error);
  }
};

export const updateEvent = (id, data) => apiClient.put(`/events/${id}`, data);
export const deleteEvent = (id) => apiClient.delete(`/events/${id}`);
