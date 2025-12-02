// src/utils/axiosInstance.js
import axios from "axios";
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4300";

const instance = axios.create({
  baseURL: API_BASE,
  withCredentials: true
});

// Set token from storage on initialization
const getStoredToken = () => {
  return localStorage.getItem("token") || sessionStorage.getItem("token");
};

const token = getStoredToken();
if (token) {
  instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

let isRefreshing = false;
let pendingRequests = [];

const processQueue = (error, token = null) => {
  pendingRequests.forEach(p => { 
    if (error) p.reject(error); 
    else p.resolve(token); 
  });
  pendingRequests = [];
};

// Request interceptor to always include token
instance.interceptors.request.use(
  (config) => {
    const token = getStoredToken();
    if (token && !config.headers["Authorization"]) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh
instance.interceptors.response.use(
  response => response, 
  async error => {
    const originalRequest = error.config;
    
    // CRITICAL FIX: Don't try to refresh token for auth endpoints
    const isAuthEndpoint = originalRequest.url?.includes('/auth/login') || 
                          originalRequest.url?.includes('/auth/mfa/verify') ||
                          originalRequest.url?.includes('/auth/forgot-password') ||
                          originalRequest.url?.includes('/auth/reset-password');
    
    // If it's a 401 on auth endpoints, just reject - don't try to refresh
    if (isAuthEndpoint) {
      return Promise.reject(error);
    }
    
    // Only attempt token refresh for 401 errors on protected endpoints
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingRequests.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers["Authorization"] = `Bearer ${token}`;
          return instance(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        const resp = await axios.post(`${API_BASE}/auth/refresh-token`, {}, { 
          withCredentials: true 
        });
        const { token } = resp.data;
        
        // Update storage
        const storage = localStorage.getItem("token") ? localStorage : sessionStorage;
        storage.setItem("token", token);
        
        instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        processQueue(null, token);
        originalRequest.headers["Authorization"] = `Bearer ${token}`;
        return instance(originalRequest);
      } catch (err) {
        processQueue(err, null);
        // Clear storage and redirect to login
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
        window.location.href = "/login";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default instance;

// // // src/utils/axiosInstance.js
// // import axios from "axios";

// // const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4300";

// // const instance = axios.create({
// //   baseURL: API_BASE,
// //   withCredentials: true,
// //   headers: {
// //     'Content-Type': 'application/json',
// //   }
// // });

// // const getStoredToken = () => {
// //   return localStorage.getItem("token") || sessionStorage.getItem("token");
// // };

// // // CRITICAL: Set token on every request
// // instance.interceptors.request.use(
// //   (config) => {
// //     const token = getStoredToken();
// //     if (token) {
// //       config.headers["Authorization"] = `Bearer ${token}`;
// //     }
// //     return config;
// //   },
// //   (error) => Promise.reject(error)
// // );

// // let isRefreshing = false;
// // let failedQueue = [];

// // const processQueue = (error, token = null) => {
// //   failedQueue.forEach(prom => {
// //     if (error) {
// //       prom.reject(error);
// //     } else {
// //       prom.resolve(token);
// //     }
// //   });
// //   failedQueue = [];
// // };

// // instance.interceptors.response.use(
// //   (response) => response,
// //   async (error) => {
// //     const originalRequest = error.config;

// //     if (error.response?.status === 401 && !originalRequest._retry) {
// //       if (isRefreshing) {
// //         return new Promise((resolve, reject) => {
// //           failedQueue.push({ resolve, reject });
// //         })
// //           .then(token => {
// //             originalRequest.headers['Authorization'] = 'Bearer ' + token;
// //             return instance(originalRequest);
// //           })
// //           .catch(err => Promise.reject(err));
// //       }

// //       originalRequest._retry = true;
// //       isRefreshing = true;

// //       try {
// //         const response = await axios.post(
// //           `${API_BASE}/auth/refresh-token`,
// //           {},
// //           { withCredentials: true }
// //         );

// //         if (response.data.success) {
// //           const { token } = response.data;
          
// //           const storage = localStorage.getItem("token") ? localStorage : sessionStorage;
// //           storage.setItem("token", token);
          
// //           instance.defaults.headers.common['Authorization'] = 'Bearer ' + token;
// //           originalRequest.headers['Authorization'] = 'Bearer ' + token;
          
// //           processQueue(null, token);
          
// //           return instance(originalRequest);
// //         }
// //       } catch (refreshError) {
// //         processQueue(refreshError, null);
// //         localStorage.clear();
// //         sessionStorage.clear();
// //         window.location.href = "/login";
// //         return Promise.reject(refreshError);
// //       } finally {
// //         isRefreshing = false;
// //       }
// //     }

// //     return Promise.reject(error);
// //   }
// // );

// // export default instance;