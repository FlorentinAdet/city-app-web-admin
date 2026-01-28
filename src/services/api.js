import axios from 'axios'

// Some env files include accidental leading/trailing spaces (e.g. "VITE_API_URL= http://...")
// Trim to avoid malformed base URLs.
const API_BASE_URL = (import.meta.env.VITE_API_URL || '/api').trim()

const api = axios.create({
  baseURL: API_BASE_URL,
  // Let axios set Content-Type per request (JSON vs multipart)
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

// Global auth failure handling: if token is missing/expired/invalid,
// clear persisted auth and force the app back to the login screen.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status
    const url = String(error?.config?.url || '')
    if (status === 401 && !url.includes('/auth/login')) {
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_info')
      localStorage.removeItem('admin_city')
      if (typeof window !== 'undefined') {
        // Keep it simple and robust: reload so AuthProvider rehydrates from storage.
        window.location.reload()
      }
    }
    return Promise.reject(error)
  }
)

// News API
export const newsAPI = {
  getAll: () => api.get('/news'),
  getById: (id) => api.get(`/news/${id}`),
  create: (data) => {
    const payload = { ...data }
    // Persist in the new canonical field name (schema.prisma: news.image)
    payload.image = data?.image ?? data?.photo ?? data?.imageUrl
    delete payload.photo
    delete payload.imageUrl
    return api.post('/news', payload)
  },
  update: (id, data) => {
    const payload = { ...data }
    payload.image = data?.image ?? data?.photo ?? data?.imageUrl
    delete payload.photo
    delete payload.imageUrl
    return api.put(`/news/${id}`, payload)
  },
  delete: (id) => api.delete(`/news/${id}`)
}

// Events API
export const eventsAPI = {
  getAll: () => api.get('/events'),
  getById: (id) => api.get(`/events/${id}`),
  create: (data) => {
    const payload = { ...data }
    payload.image = data?.image ?? data?.photo ?? data?.imageUrl
    payload.lieu = data?.lieu ?? data?.location
    payload.start_date = data?.start_date ?? data?.startDate
    payload.end_date = data?.end_date ?? data?.endDate
    delete payload.photo
    delete payload.imageUrl
    delete payload.location
    delete payload.startDate
    delete payload.endDate
    return api.post('/events', payload)
  },
  update: (id, data) => {
    const payload = { ...data }
    payload.image = data?.image ?? data?.photo ?? data?.imageUrl
    payload.lieu = data?.lieu ?? data?.location
    payload.start_date = data?.start_date ?? data?.startDate
    payload.end_date = data?.end_date ?? data?.endDate
    delete payload.photo
    delete payload.imageUrl
    delete payload.location
    delete payload.startDate
    delete payload.endDate
    return api.put(`/events/${id}`, payload)
  },
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

// Registration Forms API (admin)
export const registrationFormsAPI = {
  getAll: () => api.get('/registration-forms'),
  getById: (id) => api.get(`/registration-forms/${id}`),
  create: (data) => api.post('/registration-forms', data),
  update: (id, data) => api.put(`/registration-forms/${id}`, data),
  // Server archives the form (status=archived)
  delete: (id) => api.delete(`/registration-forms/${id}`),
  getSubmissions: (id) => api.get(`/registration-forms/${id}/submissions`)
}

// Registration Form Templates API (admin)
export const registrationFormTemplatesAPI = {
  getAll: (params) => api.get('/registration-form-templates', { params }),
  getById: (id) => api.get(`/registration-form-templates/${id}`),
  create: (data) => api.post('/registration-form-templates', data),
  update: (id, data) => api.put(`/registration-form-templates/${id}`, data),
  delete: (id) => api.delete(`/registration-form-templates/${id}`)
}

// Cities API
export const citiesAPI = {
  getAll: () => api.get('/cities'),
  getById: (id) => api.get(`/cities/${id}`)
}

// City Settings API (admin scoped)
export const citySettingsAPI = {
  get: (params) => api.get('/city-settings', { params }),
  save: (settings, params) => api.put('/city-settings', settings, { params })
}

export const cityProfileAPI = {
  getMe: (params) => api.get('/city/me', { params }),
  updateLogo: (logo_url, params) => api.put('/city/logo', { logo_url }, { params })
}

// Polls API
export const pollsAPI = {
  getAll: () => api.get('/polls'),
  getById: (id) => api.get(`/polls/${id}`),
  create: (data) => api.post('/polls', data),
  update: (id, data) => api.put(`/polls/${id}`, data),
  delete: (id) => api.delete(`/polls/${id}`)
}

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  get: (url, config) => api.get(url, config),
  post: (url, data, config) => api.post(url, data, config),
  put: (url, data, config) => api.put(url, data, config),
  delete: (url, config) => api.delete(url, config)
}

// Uploads API
export const uploadsAPI = {
  uploadImage: (file) => {
    const form = new FormData()
    form.append('file', file)
    // IMPORTANT: do not force Content-Type here.
    // The browser must set the multipart boundary, otherwise multer won't receive the file.
    return api.post('/uploads/image', form)
  },
  uploadLogo: (file) => {
    const form = new FormData()
    form.append('file', file)
    return api.post('/uploads/logo', form)
  }
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
