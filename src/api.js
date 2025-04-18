import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor untuk menambahkan token jika ada
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') // Jika pakai token authentication
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

export default api
