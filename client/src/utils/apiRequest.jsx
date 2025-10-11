import axios from "axios";

// FIX: Hardcode the backend URL to ensure API calls go to the correct port (3000)
// If your backend is running on a different port, update this value.
const BACKEND_URL = 'http://localhost:3000'; 

const apiRequest = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true,
});

export default apiRequest;
