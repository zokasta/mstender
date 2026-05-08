import axios from 'axios';
import env from '../data/env';

const baseURL = env.API_URL
// const baseURL = 'https://backend.thejunoon.in/api'
// const baseURL = 'https://706c-2409-40c1-503a-9346-60df-7150-2f5-1eb0.ngrok-free.app/api'


const Token = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    "ngrok-skip-browser-warning": "69420",
  },
});



const getToken = () => localStorage.getItem('token');

Token.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

Token.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error('Unauthorized request:', error.response.data);
    } else {
      console.error('API request error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default Token;
