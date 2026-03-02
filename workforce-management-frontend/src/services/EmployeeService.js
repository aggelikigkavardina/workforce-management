import axios from "axios";
import { getToken } from "./AuthService";

const REST_API_BASE_URL = "http://localhost:8080/api/employees";

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${getToken()}` },
});

export const listEmployees = () => axios.get(REST_API_BASE_URL, authHeaders());

export const createEmployee = (employee) =>
  axios.post(REST_API_BASE_URL, employee, authHeaders());

export const getEmployee = (employeeId) =>
  axios.get(`${REST_API_BASE_URL}/${employeeId}`, authHeaders());

export const updateEmployee = (employeeId, employee) =>
  axios.put(`${REST_API_BASE_URL}/${employeeId}`, employee, authHeaders());

export const deleteEmployee = (employeeId) =>
  axios.delete(`${REST_API_BASE_URL}/${employeeId}`, authHeaders());

export const resetEmployeePassword = (id) =>
  axios.post(`${REST_API_BASE_URL}/${id}/reset-password`, {}, authHeaders());

export const getMyProfile = () =>
  axios.get(`${REST_API_BASE_URL}/me`, authHeaders());

export const updateMyProfile = (profile) =>
  axios.put(`${REST_API_BASE_URL}/me`, profile, authHeaders());