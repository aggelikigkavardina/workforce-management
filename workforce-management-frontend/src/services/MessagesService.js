import api from "./api";
import { isAdminUser } from "./AuthService";

export const createConversation = (payload) => {
  if (isAdminUser()) {
    return api.post("/api/admin/conversations", payload);
  }
  return api.post("/api/conversations", payload);
};

export const listConversations = () => {
  if (isAdminUser()) {
    return api.get("/api/admin/conversations");
  }
  return api.get("/api/conversations");
};

export const getConversation = (id) => api.get(`/api/conversations/${id}`);

export const sendMessage = (id, content) => api.post(`/api/conversations/${id}/messages`, { content });

export const markRead = (id) => api.put(`/api/conversations/${id}/read`);