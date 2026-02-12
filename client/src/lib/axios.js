import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:5000/api",
});

// 🔥 Automatically attach token to every request
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // token from localStorage

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default instance;
