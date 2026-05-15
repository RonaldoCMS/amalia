import axios from 'axios'

export const backendClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  headers: { 'Content-Type': 'application/json' },
})

backendClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (
      typeof window !== 'undefined' &&
      error.response?.status === 403 &&
      error.response?.data?.banned === true &&
      window.location.pathname !== '/ban'
    ) {
      localStorage.setItem('ban_info', JSON.stringify(error.response.data))
      window.location.href = '/ban'
    }
    return Promise.reject(error)
  }
)