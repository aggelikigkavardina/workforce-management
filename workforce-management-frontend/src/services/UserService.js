import api from "./api";

export const changeMyPassword = (currentPassword, newPassword) =>
  api.put("/api/users/me/password", { currentPassword, newPassword });