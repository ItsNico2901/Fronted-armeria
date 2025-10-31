import React, { useCallback, useEffect, useState } from 'react'
import api, { normalizeRole } from '../api'
import styles from './UsuariosGestion.module.css'

function normalizeUser(raw) {
  const username = raw?.username ?? raw?.user ?? raw?.nombre ?? ''
  const role = normalizeRole(raw?.role ?? raw?.rol ?? 'USUARIO')
  const active = Boolean(
    raw?.active ??
      raw?.habilitado ??
      raw?.enabled ??
      raw?.estado ??
      raw?.isActive ??
      raw?.activo ??
      raw?.status ??
      true,
  )
  const id = raw?.id ?? raw?.userId ?? username ?? `user_${Date.now()}`
  return { id, username, role, active }
}

const emptyForm = () => ({
  username: '',
  password: '',
  confirm: '',
  role: 'USUARIO',
  active: true,
})

export default function UsuariosGestion() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState('')

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/users')
      const data = res?.data
      let list = []
      if (Array.isArray(data)) list = data
      else if (data && Array.isArray(data.users)) list = data.users
      else if (data && Array.isArray(data.data)) list = data.data
      else if (data && typeof data === 'object') {
        const key = Object.keys(data).find((k) => Array.isArray(data[k]))
        if (key) list = data[key]
      }
      setUsers(list.map(normalizeUser))
    } catch (err) {
      console.error('No se pudieron obtener los usuarios:', err)
      const details = err?.response?.data
      const msg =
        details?.message ||
        details?.msg ||
        details?.error ||
        (typeof details === 'string' ? details : '') ||
        err?.message ||
        'No se pudo obtener la lista de usuarios.'
      setError(msg)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleFieldChange = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }, [])

  const resetForm = useCallback(() => {
    setForm(emptyForm())
  }, [])

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault()
      const username = form.username.trim()
      const password = form.password.trim()
      const confirm = form.confirm.trim()

      setFeedback('')
      if (!username || !password) {
        setFeedback('Usuario y contraseña obligatorios.')
        return
      }
      if (password.length < 4) {
        setFeedback('La contraseña debe tener al menos 4 caracteres.')
        return
      }
      if (password !== confirm) {
        setFeedback('Las contraseñas no coinciden.')
        return
      }

      setSaving(true)
      try {
        const payload = {
          username,
          password,
          role: normalizeRole(form.role || 'USUARIO', 'payload'),
          active: Boolean(form.active),
        }
        await api.post('/users', payload, {
          headers: { 'Content-Type': 'application/json' },
          transformRequest: [
            (data, headers) => {
              headers['Content-Type'] = 'application/json'
              return JSON.stringify(data)
            },
          ],
        })
        await fetchUsers()
        resetForm()
        setFeedback('Usuario creado correctamente.')
      } catch (err) {
        console.error('No se pudo crear el usuario:', err)
        const details = err?.response?.data
        const msg =
          details?.message ||
          details?.msg ||
          details?.error ||
          (typeof details === 'string' ? details : '') ||
          err?.message ||
          'No se pudo crear el usuario.'
        setFeedback(msg)
      } finally {
        setSaving(false)
      }
    },
    [form, fetchUsers, resetForm],
  )

  return (
    <div className={`card ${styles.container}`}>
      <h2>Gestión de Usuarios</h2>
      <p className={styles.note}>
        Administra las credenciales del personal de armería, asigna roles operativos y controla quién puede acceder al arsenal digital.
      </p>
      <div className={styles.toolbar}>
        <button onClick={fetchUsers} disabled={loading || saving}>
          {loading ? 'Actualizando...' : 'Actualizar'}
        </button>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <form className={styles.form} onSubmit={handleSubmit}>
        <h3>Crear nuevo usuario</h3>
        <div className={styles.formGrid}>
          <label className={styles.label}>
            Usuario
            <input value={form.username} onChange={(e) => handleFieldChange('username', e.target.value)} disabled={saving} />
          </label>
          <label className={styles.label}>
            Rol
            <select value={form.role} onChange={(e) => handleFieldChange('role', e.target.value)} disabled={saving}>
              <option value="ADMIN">ADMIN</option>
              <option value="USUARIO">USUARIO</option>
            </select>
          </label>
          <label className={styles.label}>
            Contraseña
            <input type="password" value={form.password} onChange={(e) => handleFieldChange('password', e.target.value)} disabled={saving} />
          </label>
          <label className={styles.label}>
            Confirmar
            <input type="password" value={form.confirm} onChange={(e) => handleFieldChange('confirm', e.target.value)} disabled={saving} />
          </label>
        </div>
        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={Boolean(form.active)}
            onChange={(e) => handleFieldChange('active', e.target.checked)}
            disabled={saving}
          />
          Usuario activo
        </label>
        <div className={styles.formActions}>
          <button type="submit" disabled={saving}>
            {saving ? 'Guardando...' : 'Crear usuario'}
          </button>
          <button type="button" className="secondary" onClick={resetForm} disabled={saving}>
            Limpiar
          </button>
        </div>
        {feedback && <p className={styles.feedback}>{feedback}</p>}
      </form>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Rol</th>
              <th>Activo</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3} className={styles.message}>
                  Cargando usuarios...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={3} className={styles.message}>
                  Aún no se registran credenciales para el personal de la armería.
                </td>
              </tr>
            ) : (
              users.map((user, idx) => (
                <tr key={user.id} className={idx % 2 === 1 ? styles.altRow : undefined}>
                  <td>{user.username}</td>
                  <td>{user.role}</td>
                  <td>
                    <span className={user.active ? styles.activeBadge : styles.inactiveBadge}>
                      {user.active ? 'Sí' : 'No'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
