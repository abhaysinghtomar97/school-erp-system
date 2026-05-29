import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    
    // THIS IS THE NEW MAGIC LINE!
    // It tells Axios: "Always send and receive cookies with every request."
    withCredentials: true,
});

console.log("Axios is pointing to Backend URL:", import.meta.env.VITE_API_URL || 'http://localhost:5000/api');

// Notice that the interceptor is completely gone! 
// The browser will now securely handle the token attachment behind the scenes.

export default api;