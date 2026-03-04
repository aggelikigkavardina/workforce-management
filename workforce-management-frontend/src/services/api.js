import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080",
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url || "";

    if ((status === 401 || status === 403) && url.includes("/api/auth/login")) {
      return Promise.reject(error);
    }

    if (status === 401 || status === 403) {
      localStorage.removeItem("token");
      localStorage.removeItem("loggedInUser");
      localStorage.removeItem("role");
      localStorage.removeItem("mustChangePassword");

      window.location.assign("/");
    }

    return Promise.reject(error);
  }
);

export default api;