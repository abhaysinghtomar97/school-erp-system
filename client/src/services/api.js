import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL ,  //backend api
});

// Automatically attach the JWT token to every request if the user is logged in
API.interceptors.request.use((req) => {
    const token = localStorage.getItem('token');
    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});

export default API;