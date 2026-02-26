import axios from 'axios';

export const changeMyPassword = (currentPassword, newPassword) =>
  axios.put('http://localhost:8080/api/users/me/password', {
    currentPassword,
    newPassword,
  });