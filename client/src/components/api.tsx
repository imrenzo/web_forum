import axios from 'axios';

const api = axios.create({
    // baseURL: 'http://localhost:8080', // Backend server URL
    baseURL: 'https://web-forum-test-backend.onrender.com',
});

export default api;