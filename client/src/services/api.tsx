import axios from 'axios';

const api = axios.create({
    // baseURL: 'http://localhost:8080', // development server URL
    baseURL: 'https://web-forum-test-backend.onrender.com', // render URL
});

export default api;