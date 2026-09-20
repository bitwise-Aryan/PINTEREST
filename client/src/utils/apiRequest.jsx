import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_API_ENDPOINT || 'http://localhost:3000'; 

const apiRequest = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true,
});

export default apiRequest;
