import api from "./api";

const SHIFT_API_BASE_URL = "/api/shifts";

export const getMyShifts = () => api.get(`${SHIFT_API_BASE_URL}/my`);

export const getAllShifts = (employeeId) => {
  if (employeeId) {
    return api.get(SHIFT_API_BASE_URL, { params: { employeeId } });
  }
  return api.get(SHIFT_API_BASE_URL);
};

export const createShift = (shift) => api.post(SHIFT_API_BASE_URL, shift);

export const updateShift = (shiftId, shift) => api.put(`${SHIFT_API_BASE_URL}/${shiftId}`, shift);

export const deleteShift = (shiftId) => api.delete(`${SHIFT_API_BASE_URL}/${shiftId}`);