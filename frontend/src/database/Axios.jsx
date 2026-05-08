import axios from "axios";
import env from "../data/env";
const Axios = axios.create({
  baseURL: env.API_URL,  
  // baseURL: 'https://8bc3-2409-40c1-503a-9346-60df-7150-2f5-1eb0.ngrok-free.app',
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
  withCredentials: true,  
});

export default Axios;
