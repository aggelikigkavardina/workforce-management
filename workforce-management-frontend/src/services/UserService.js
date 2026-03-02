import axios from "axios";
import { getToken } from "./AuthService";

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${getToken()}` },
});

export const changeMyPassword = (currentPassword, newPassword) =>
  axios.put(
    "http://localhost:8080/api/users/me/password",
    { currentPassword, newPassword },
    authHeaders()
  );