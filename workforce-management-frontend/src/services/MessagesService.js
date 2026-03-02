import axios from "axios";
import { isAdminUser } from "./AuthService";

const BASE = "http://localhost:8080";

export const createConversation = (payload) => {
  return isAdminUser()
    ? axios.post(`${BASE}/api/admin/conversations`, payload)
    : axios.post(`${BASE}/api/conversations`, payload);
};

export const listConversations = () => {
  return isAdminUser()
    ? axios.get(`${BASE}/api/admin/conversations`)
    : axios.get(`${BASE}/api/conversations`);
};

export const getConversation = (id) =>
  axios.get(`${BASE}/api/conversations/${id}`);

export const sendMessage = (id, content) =>
  axios.post(`${BASE}/api/conversations/${id}/messages`, { content });

export const markRead = (id) =>
  axios.put(`${BASE}/api/conversations/${id}/read`);