import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Attach Authorization header if token is stored
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token')
  if (token) {
    config.headers = config.headers || {}
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
})

// News API
export const newsAPI = {
  getAll: () => api.get('/news'),
  getById: (id) => api.get(`/news/${id}`),
  create: (data) => api.post('/news', data),
  update: (id, data) => api.put(`/news/${id}`, data),
  delete: (id) => api.delete(`/news/${id}`)
}

// Events API
export const eventsAPI = {
  getAll: () => api.get('/events'),
  getById: (id) => api.get(`/events/${id}`),
  create: (data) => api.post('/events', data),
  update: (id, data) => api.put(`/events/${id}`, data),
  delete: (id) => api.delete(`/events/${id}`)
}

// Reports API
export const reportsAPI = {
  getAll: () => api.get('/reports'),
  getById: (id) => api.get(`/reports/${id}`),
  create: (data) => api.post('/reports', data),
  update: (id, data) => api.put(`/reports/${id}`, data),
  delete: (id) => api.delete(`/reports/${id}`)
}

// Users API
export const usersAPI = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`)
}

// Cities API
export const citiesAPI = {
  getAll: () => api.get('/cities'),
  getById: (id) => api.get(`/cities/${id}`)
}

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  get: (url, config) => api.get(url, config),
  post: (url, data, config) => api.post(url, data, config),
  put: (url, data, config) => api.put(url, data, config),
  delete: (url, config) => api.delete(url, config)
}

// Admin API (superadmin only)
export const adminAPI = {
  getCities: () => api.get('/admin/cities'),
  createCity: (data) => api.post('/admin/cities', data),
  getAdmins: () => api.get('/admin/admins'),
  createAdmin: (data) => api.post('/admin/admins', data),
  deleteAdmin: (id) => api.delete(`/admin/admins/${id}`)
}

export default api
