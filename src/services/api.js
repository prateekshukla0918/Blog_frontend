import axios from "axios";

const baseURL = "https://blog-backend-o0zq.onrender.com/api";
const localURL = "http://localhost:4000/api";

const API = axios.create({
  baseURL: baseURL,
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export default API;
