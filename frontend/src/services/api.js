import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cs_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const fetchAssignments = (params = {}) =>
  api.get('/assignments', { params }).then(r => r.data.assignments);

export const fetchAssignment = (id) =>
  api.get(`/assignments/${id}`).then(r => r.data.assignment);

export const executeQuery = (assignmentId, query) =>
  api.post('/query/execute', { assignmentId, query }).then(r => r.data);

export const getHint = (assignmentId, userQuery, previousHints = []) =>
  api.post('/hint', { assignmentId, userQuery, previousHints }).then(r => r.data.hint);

export const login = (email, password) =>
  api.post('/auth/login', { email, password }).then(r => r.data);

export const signup = (name, email, password) =>
  api.post('/auth/signup', { name, email, password }).then(r => r.data);

export const saveAttempt = (assignmentId, query, wasSuccessful) =>
  api.post('/auth/attempt', { assignmentId, query, wasSuccessful }).catch(() => {});

export const submitAssignment = (assignmentId, finalQuery) =>
  api.post('/auth/submit', { assignmentId, finalQuery }).then(r => r.data);

export const getProgress = () =>
  api.get('/auth/progress').then(r => r.data.completedIds);

export default api;
