import axios from 'axios'

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const API = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for cookies
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to every request
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle 401 errors (token expired)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired - redirect to login
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);


export const authAPI = {

    register:(data)=>API.post('/auth/register',data),

    login:(data)=> API.post('/auth/login',data),

    logout:()=>API.post('/auth/logout'),

    verifyToken:()=>API.get('/auth/me')

};

export const wishlistApi = {

    getWishlist:()=>API.get('/wishlist'),

    addToWishlist: (productId)=> API.post(`/wishlist/${productId}`),

    removeFromWishlist: (productId)=>API.delete(`/wishlist/${productId}`),

    clearWishlist: () => API.delete('/wishlist'),
  
}

console.log("auth token in localstorage = ",localStorage.getItem('authToken'))

export default API;