import api from "./api";

const REST_API_BASE_URL = "/api/employees";

export const listEmployees = () => api.get(REST_API_BASE_URL);

export const createEmployee = (employee) => api.post(REST_API_BASE_URL, employee);

export const getEmployee = (employeeId) => api.get(`${REST_API_BASE_URL}/${employeeId}`);

export const updateEmployee = (employeeId, employee) => api.put(`${REST_API_BASE_URL}/${employeeId}`, employee);

export const deleteEmployee = (employeeId) => api.delete(`${REST_API_BASE_URL}/${employeeId}`);

export const resetEmployeePassword = (employeeId) => api.post(`${REST_API_BASE_URL}/${employeeId}/reset-password`, {});

export const getMyProfile = () => api.get(`${REST_API_BASE_URL}/me`);

export const updateMyProfile = (profilePayload) => api.put(`${REST_API_BASE_URL}/me`, profilePayload);