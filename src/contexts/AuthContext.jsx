// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState } from 'react'
import api from '../api'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('armeria_user')) || null
    } catch {
      return null
    }
  })

  const [sessionProducts, setSessionProducts] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem('session_products')) || []
    } catch {
      return []
    }
  })

  const persistSessionProducts = (list) => {
    setSessionProducts(list)
    try {
      sessionStorage.setItem('session_products', JSON.stringify(list))
    } catch {
      // ignore storage errors
    }
  }

  async function login(username, password) {
    if (!username || !password) {
      throw new Error('Faltan credenciales')
    }

    let res
    try {
      res = await api.post('/login', { username, password })
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data?.msg || err?.message || 'Error de conexión'
      throw new Error(msg)
    }

    const u = res?.data?.user ?? null
    if (!u || !u.username || !('role' in u)) {
      const pretty = JSON.stringify(res?.data ?? {})
      throw new Error('Respuesta inválida del servidor en /login: ' + pretty)
    }

    localStorage.setItem('armeria_user', JSON.stringify(u))
    setUser(u)
    persistSessionProducts([])
    return u
  }

  function logout() {
    localStorage.removeItem('armeria_user')
    setUser(null)
    persistSessionProducts([])
  }

  function addSessionProduct(prod) {
    const next = [...sessionProducts, prod]
    persistSessionProducts(next)
  }

  function updateSessionProduct(id, changes) {
    const next = sessionProducts.map((p) => (String(p.id) === String(id) ? { ...p, ...changes } : p))
    persistSessionProducts(next)
  }

  function removeSessionProduct(id) {
    const next = sessionProducts.filter((p) => String(p.id) !== String(id))
    persistSessionProducts(next)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        sessionProducts,
        addSessionProduct,
        updateSessionProduct,
        removeSessionProduct,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
