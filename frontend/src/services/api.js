import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const login = (credentials) => api.post('/auth/login', credentials);
export const verifyToken = () => api.get('/auth/verify');

// Config
export const getConfig = () => api.get('/config');
export const updateConfig = (data) => api.put('/config', data);
export const toggleAutomation = () => api.post('/config/toggle');

// Accounts
export const getAccounts = () => api.get('/accounts');
export const createAccount = (data) => api.post('/accounts', data);
export const updateAccount = (id, data) => api.put(`/accounts/${id}`, data);
export const deleteAccount = (id) => api.delete(`/accounts/${id}`);
export const testAccount = (id) => api.post(`/accounts/${id}/test`);

// Subreddits
export const getSubreddits = () => api.get('/subreddits');
export const createSubreddit = (data) => api.post('/subreddits', data);
export const updateSubreddit = (id, data) => api.put(`/subreddits/${id}`, data);
export const deleteSubreddit = (id) => api.delete(`/subreddits/${id}`);
export const searchSubreddits = (query) => api.get(`/subreddits/search?q=${query}`);
export const scanSubreddit = (id) => api.post(`/subreddits/${id}/scan`);
export const getSubredditStats = (id) => api.get(`/subreddits/${id}/stats`);

// Queue
export const getQueue = (params) => api.get('/queue', { params });
export const generateComment = (postId, data) => api.post(`/queue/${postId}/generate`, data);
export const approveComment = (data) => api.post('/queue/approve', data);
export const skipPost = (postId) => api.post(`/queue/${postId}/skip`);
export const bulkApprove = (commentIds) => api.post('/queue/bulk-approve', { commentIds });
export const bulkReject = (postIds) => api.post('/queue/bulk-reject', { postIds });

// Comments
export const getComments = (params) => api.get('/comments', { params });
export const postComment = (id) => api.post(`/comments/${id}/post`);
export const updateComment = (id, data) => api.put(`/comments/${id}`, data);
export const deleteComment = (id) => api.delete(`/comments/${id}`);
export const checkCommentStatus = (id) => api.get(`/comments/${id}/status`);

// Analytics
export const getDashboardStats = () => api.get('/analytics/dashboard');
export const getActivityTimeline = (days) => api.get(`/analytics/activity?days=${days}`);
export const getSubredditPerformance = () => api.get('/analytics/subreddits');
export const getRecentActivity = (limit) => api.get(`/analytics/logs?limit=${limit}`);
export const getKarmaOverTime = (days) => api.get(`/analytics/karma?days=${days}`);

export default api;
