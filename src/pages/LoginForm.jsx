// src/pages/LoginForm.jsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import styles from './LoginForm.module.css'

export default function LoginForm() {
  const { login } = useAuth()
  const nav = useNavigate()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    if (!username || !password) {
      setError('Introduce usuario y contraseña.')
      return
    }
    setLoading(true)
    try {
      const user = await login(username, password)
      const role = String(user?.role ?? '').toUpperCase()
      if (role === 'INVITADO' || role === 'GUEST') {
        nav('/guest', { replace: true })
      } else {
        nav('/menu', { replace: true })
      }
    } catch (err) {
      setError(err?.message || 'Error inesperado al iniciar sesión.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.panel}>
        <h2 className={styles.title}>Iniciar sesión</h2>
        <p className={styles.subtitle}>
          Controla el arsenal digital de la armería. Inicia sesión con tus credenciales para supervisar existencias,
          movimientos y reportes de tiro.
        </p>

        <form onSubmit={onSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="username">Usuario</label>
            <input
              id="username"
              className={styles.input}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              placeholder="Nombre de usuario"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="password">Contraseña</label>
            <div className={styles.passwordRow}>
              <input
                id="password"
                className={styles.input}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="••••••••"
              />
              <button
                type="button"
                className={styles.toggle}
                onClick={() => setShowPassword((s) => !s)}
                aria-pressed={showPassword}
              >
                {showPassword ? 'Ocultar' : 'Ver'}
              </button>
            </div>
          </div>

          {error && (
            <div className={styles.error} role="alert">
              {error}
            </div>
          )}

          <div className={styles.actions}>
            <button type="submit" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
            <button
              type="button"
              className="secondary"
              onClick={() => {
                setUsername('')
                setPassword('')
                setError('')
              }}
            >
              Cancelar
            </button>
          </div>
          <p className={styles.helper}>Cada acceso queda registrado en el libro de guardia y auditado por el armero jefe.</p>
        </form>
      </div>
    </div>
  )
}
