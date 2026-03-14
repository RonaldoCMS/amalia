import axios from 'axios'

export const backendClient = axios.create({
  baseURL: process.env.BACKEND_URL,
  headers: { 'Content-Type': 'application/json' },
})