import axios from 'axios';

const SHIFT_API_BASE_URL = 'http://localhost:8080/api/shifts';

export const getMyShifts = () => axios.get(`${SHIFT_API_BASE_URL}/my`);

export const getAllShifts = (employeeId) => {
  if (employeeId) {
    return axios.get(SHIFT_API_BASE_URL, { params: { employeeId } });
  }
  return axios.get(SHIFT_API_BASE_URL);
};

export const createShift = (shift) => axios.post(SHIFT_API_BASE_URL, shift);

export const updateShift = (shiftId, shift) => axios.put(`${SHIFT_API_BASE_URL}/${shiftId}`, shift);

export const deleteShift = (shiftId) => axios.delete(`${SHIFT_API_BASE_URL}/${shiftId}`);