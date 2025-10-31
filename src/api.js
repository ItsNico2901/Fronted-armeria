// src/api.js
import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api'

const roleHeaderMap = {
  ADMIN: 'admin',
  USER: 'user',
  USUARIO: 'user',
  GUEST: 'guest',
  INVITADO: 'guest',
}

const rolePayloadMap = {
  ADMIN: 'ADMIN',
  USER: 'USER',
  USUARIO: 'USER',
  GUEST: 'GUEST',
  INVITADO: 'INVITADO',
}

export function normalizeRole(role, target = 'payload') {
  if (!role) return ''
  const key = String(role).toUpperCase()
  if (target === 'header') {
    return roleHeaderMap[key] ?? key.toLowerCase()
  }
  return rolePayloadMap[key] ?? key
}

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((cfg) => {
  try {
    const raw = JSON.parse(localStorage.getItem('armeria_user'))
    const r = raw?.role
    if (r) {
      cfg.headers['x-role'] = normalizeRole(r, 'header')
    }
  } catch {
    // ignore
  }
  return cfg
})

export default api
