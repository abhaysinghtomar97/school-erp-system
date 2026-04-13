import axios from 'axios';

const api = axios.create({
    // This is the magic line! 
    // It looks for your Render URL in Vercel/Netlify. If it doesn't find one, it uses localhost.
    baseURL: import.meta.env.VITE_API_URL ,
});

// Optional: If you eventually want to secure your routes again, 
// your token logic stays right here!
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token'); 
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;