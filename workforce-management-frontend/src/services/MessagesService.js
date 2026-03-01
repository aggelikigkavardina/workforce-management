import axios from "axios";
import { isAdminUser } from "./AuthService";

const BASE = "http://localhost:8080";

export const listConversations = () => {
  if (isAdminUser()) return axios.get(`${BASE}/api/admin/conversations`);
  return axios.get(`${BASE}/api/conversations`);
};

export const createConversation = (payload) => {
  // employee payload: { subject }
  // admin payload: { subject, employeeId } 
  if (isAdminUser()) return axios.post(`${BASE}/api/admin/conversations`, payload);
  return axios.post(`${BASE}/api/admin/conversations`, payload);
};

export const getConversation = (id) =>
  axios.get(`${BASE}/api/conversations/${id}`);

export const sendMessage = (id, content) =>
  axios.post(`${BASE}/api/conversations/${id}/messages`, { content });

export const markRead = (id) =>
  axios.put(`${BASE}/api/conversations/${id}/read`);