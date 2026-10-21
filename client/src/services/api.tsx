import axios from 'axios';

const api = axios.create({
    // set at build time; see .env.example
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080',
});

export default api;