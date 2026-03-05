import api from "./api";

const AUTH_REST_API_BASE_URL = "/api/auth";

export const loginAPICall = (username, password) =>
  api.post(`${AUTH_REST_API_BASE_URL}/login`, {
    username,
    password,
  });

export const logoutAPICall = () => api.post(`${AUTH_REST_API_BASE_URL}/logout`);

export const saveToken = (token) => {
  localStorage.setItem("token", token);
};

export const getToken = () => {
  return localStorage.getItem("token");
};

export const saveLoggedInUser = (username, role, mustChangePassword) => {
  localStorage.setItem("loggedInUser", username);
  localStorage.setItem("role", role);
  localStorage.setItem("mustChangePassword", String(!!mustChangePassword));
};

export const getLoggedInUser = () => {
  return localStorage.getItem("loggedInUser");
};

export const getUserRole = () => {
  return localStorage.getItem("role");
};

export const mustChangePassword = () => {
  return localStorage.getItem("mustChangePassword") === "true";
};

export const isUserLoggedIn = () => {
  return !!getToken();
};

export const isAdminUser = () => {
  return getUserRole() === "ROLE_ADMIN";
};

export const isEmployeeUser = () => {
  return getUserRole() === "ROLE_EMPLOYEE";
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("loggedInUser");
  localStorage.removeItem("role");
  localStorage.removeItem("mustChangePassword");
};