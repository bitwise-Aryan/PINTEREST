import axios from "axios";

const apiRequest = axios.create({//we may have used tedux toolkit query
  baseURL: import.meta.env.VITE_API_ENDPOINT,
  withCredentials: true,
});

export default apiRequest;