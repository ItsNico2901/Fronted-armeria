// src/pages/AdminMenu.jsx
import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../api'
import styles from './AdminMenu.module.css'

export default function AdminMenu() {
  const { user } = useAuth()
  const nav = useNavigate()

  const [counts, setCounts] = useState({ users: 0, products: 0 })
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadSummary = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [uRes, pRes] = await Promise.all([api.get('/users'), api.get('/productos')])
      const userList = Array.isArray(uRes?.data) ? uRes.data : Array.isArray(uRes?.data?.users) ? uRes.data.users : []
      const productList = Array.isArray(pRes?.data)
        ? pRes.data
        : Array.isArray(pRes?.data?.productos)
        ? pRes.data.productos
        : []

      setCounts({
        users: userList.length,
        products: productList.length,
      })
      setRecent(productList.slice(0, 5))
    } catch (err) {
      console.error('No se pudo cargar el resumen de admin:', err)
      setError('No se pudo cargar el resumen. Intenta refrescar más tarde.')
      setCounts({ users: 0, products: 0 })
      setRecent([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSummary()
  }, [loadSummary])

  async function handleDelete(product) {
    const reference = product.persistedId ?? product.id ?? product.code
    if (!reference) return
    if (!window.confirm('¿Eliminar este producto del inventario?')) return
    try {
      await api.delete(`/productos/${reference}`)
      setRecent((prev) => prev.filter((p) => (p.persistedId ?? p.id ?? p.code) !== reference))
      setCounts((prev) => ({ ...prev, products: Math.max(0, prev.products - 1) }))
    } catch (err) {
      console.error('No se pudo eliminar el producto:', err)
      alert('No se pudo eliminar el producto. Revisa la consola para más detalles.')
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <h1>Cuartel general</h1>
          <p>
            Bienvenido <strong>{user?.username ?? '—'}</strong> · Rol: <em>{user?.role ?? '—'}</em>
          </p>
          <p className={styles.tagline}>Coordina personal autorizado, calibra el arsenal y mantén la traza de cada movimiento.</p>
        </div>
        <div>
          <button onClick={loadSummary} disabled={loading}>
            {loading ? 'Actualizando…' : 'Actualizar'}
          </button>
        </div>
      </header>

      <section className={styles.metrics}>
        <article className={`card ${styles.statCard}`}>
          <h3>Usuarios</h3>
          <div className={styles.statValue}>{loading ? '—' : counts.users}</div>
          <p className={styles.statHint}>Listado de armeros, vendedores y vigilantes con acceso vigente.</p>
          <button onClick={() => nav('/usuarios')}>Gestionar usuarios</button>
        </article>

        <article className={`card ${styles.statCard}`}>
          <h3>Productos</h3>
          <div className={styles.statValue}>{loading ? '—' : counts.products}</div>
          <p className={styles.statHint}>Control de armas, municiones y accesorios catalogados.</p>
          <button onClick={() => nav('/productos')}>Gestionar inventario</button>
        </article>

        <article className={`card ${styles.statCard}`}>
          <h3>Reportes</h3>
          <div className={styles.statValue} style={{ fontSize: 20 }}>
            {loading ? '—' : 'Listos'}
          </div>
          <p className={styles.statHint}>Descarga informes de existencias, ventas y registros de mantenimiento.</p>
          <button onClick={() => nav('/reportes')}>Ver reportes</button>
        </article>
      </section>

      <section className={`card ${styles.recentCard}`}>
        <div className={styles.recentHeader}>
          <h3>Últimos productos</h3>
          <button className="secondary" onClick={() => nav('/productos')}>
            Ver todos
          </button>
        </div>

        {error && <div className={styles.emptyState}>{error}</div>}

        {!error && loading && <div className={styles.emptyState}>Cargando datos…</div>}

        {!error && !loading && recent.length === 0 && (
          <div className={styles.emptyState}>No hay productos registrados recientemente.</div>
        )}

        {!error && !loading && recent.length > 0 && (
          <ul className={styles.recentList}>
            {recent.map((p, idx) => {
              const reference = p.persistedId ?? p.id ?? p.code
              return (
                <li key={reference ?? idx} className={styles.recentItem}>
                  <div>
                    <strong>{p.name}</strong>{' '}
                    <small className={styles.code}>({p.code ?? '—'})</small>
                    <div className={styles.recentMeta}>
                      {p.type} · {p.estado ?? p.status ?? 'Desconocido'} · {p.quantity ?? 0} uds.
                    </div>
                  </div>
                  <div>
                    <div className={styles.recentActions}>
                      <button className="secondary" onClick={() => nav(`/productos?id=${encodeURIComponent(reference ?? '')}`)}>
                        Ver
                      </button>
                      <button className="secondary" onClick={() => nav(`/productos/edit/${encodeURIComponent(reference ?? '')}`)}>
                        Editar
                      </button>
                      <button className={styles.danger} onClick={() => handleDelete(p)}>
                        Eliminar
                      </button>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
