import axios from 'axios';

const AUTH_REST_API_BASE_URL = 'http://localhost:8080/api/auth';

export const loginAPICall = (username, password) =>
    axios.post(AUTH_REST_API_BASE_URL + '/login', {
        username,
        password
    });

export const saveToken = (token) => {
    localStorage.setItem('token', token);
};

export const getToken = () => {
    return localStorage.getItem('token');
};

export const saveLoggedInUser = (username, role, mustChangePassword) => {
    localStorage.setItem('authenticatedUser', username);
    localStorage.setItem('role', role);
    localStorage.setItem('mustChangePassword', String(!!mustChangePassword));
};

export const getLoggedInUser = () => {
    return localStorage.getItem('authenticatedUser');
};

export const getUserRole = () => {
    return localStorage.getItem('role');
};

export const isAdminUser = () => {
    return getUserRole() === 'ROLE_ADMIN';
};

export const isEmployeeUser = () => {
    return getUserRole() === 'ROLE_EMPLOYEE';
};

export const logout = () => {
    localStorage.clear();
};

export const isUserLoggedIn = () => !!getToken();

export const logoutAPICall = () =>
  axios.post('http://localhost:8080/api/auth/logout');

export const mustChangePassword = () => localStorage.getItem('mustChangePassword') === 'true';