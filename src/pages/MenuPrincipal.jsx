// src/pages/MenuPrincipal.jsx
import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../api'
import styles from './MenuPrincipal.module.css'

export default function MenuPrincipal() {
  const { user, logout } = useAuth()
  const nav = useNavigate()

  const [usersCount, setUsersCount] = useState(0)
  const [productsCount, setProductsCount] = useState(0)
  const [recentProducts, setRecentProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const role = String(user?.role ?? '').toUpperCase()
  const canEdit = role === 'ADMIN' || role === 'USER'

  const loadSummary = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [usersRes, productsRes] = await Promise.all([
        api.get('/users').catch(() => ({ data: [] })),
        api.get('/productos').catch(() => ({ data: [] })),
      ])
      const usersList = Array.isArray(usersRes?.data) ? usersRes.data : Array.isArray(usersRes?.data?.users) ? usersRes.data.users : []
      const productsList = Array.isArray(productsRes?.data)
        ? productsRes.data
        : Array.isArray(productsRes?.data?.productos)
        ? productsRes.data.productos
        : []

      setUsersCount(usersList.length)
      setProductsCount(productsList.length)
      setRecentProducts(productsList.slice(0, 6))
    } catch (err) {
      console.error('No se pudo cargar el resumen:', err)
      setError('No se pudieron cargar los datos. Intenta de nuevo en unos minutos.')
      setUsersCount(0)
      setProductsCount(0)
      setRecentProducts([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSummary()
  }, [loadSummary])

  function handleLogout() {
    logout()
    nav('/login')
  }

  function handleViewProduct(product) {
    const reference = product.persistedId ?? product.id ?? product.code
    if (!reference) return
    nav(`/productos?id=${encodeURIComponent(reference)}`)
  }

  function handleEditProduct(product) {
    const reference = product.persistedId ?? product.id ?? product.code
    if (!reference) return
    nav(`/productos/edit/${encodeURIComponent(reference)}`)
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <h1>Puesto de mando</h1>
          <p>
            Bienvenido <strong>{user?.username ?? '—'}</strong> · Rol: <em>{user?.role ?? '—'}</em>
          </p>
          <p className={styles.summaryHint}>Supervisa personal, arsenal disponible y la rotación diaria de equipos desde un mismo panel.</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={loadSummary} disabled={loading}>
            {loading ? 'Actualizando…' : 'Actualizar'}
          </button>
          <button className="secondary" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      </header>

      <section className={styles.summary}>
        <article className={`card ${styles.summaryCard}`}>
          <h3>Usuarios</h3>
          <div className={styles.summaryValue}>{loading ? '—' : usersCount}</div>
          <p className={styles.summaryHintCard}>Armeros, responsables de tienda y personal de vigilancia autorizados.</p>
          {role === 'ADMIN' ? (
            <button onClick={() => nav('/usuarios')}>Gestionar usuarios</button>
          ) : (
            <small>Acceso restringido a administradores</small>
          )}
        </article>

        <article className={`card ${styles.summaryCard}`}>
          <h3>Productos</h3>
          <div className={styles.summaryValue}>{loading ? '—' : productsCount}</div>
          <p className={styles.summaryHintCard}>Armas cortas, largas, munición y accesorios listos para entrega.</p>
          <button onClick={() => nav('/productos')}>Gestionar inventario</button>
        </article>

        <article className={`card ${styles.summaryCard}`}>
          <h3>Reportes</h3>
          <p className={styles.summaryHintCard}>Genera listados y filtros sobre ventas, reservas y mantenimientos.</p>
          <button onClick={() => nav('/reportes')}>Ir a reportes</button>
        </article>
      </section>

      <section className={`card ${styles.recentCard}`}>
        <h3 style={{ marginTop: 0 }}>Últimos productos</h3>
        <p className={styles.recentIntro}>Listado rápido de las últimas piezas incorporadas al stock de la armería.</p>
        {error && <div className={styles.empty}>{error}</div>}
        {!error && loading && <div className={styles.empty}>Cargando productos…</div>}
        {!error && !loading && recentProducts.length === 0 && (
          <div className={styles.empty}>Todavía no hay productos registrados.</div>
        )}
        {!error && !loading && recentProducts.length > 0 && (
          <ul className={styles.recentList}>
            {recentProducts.map((p, idx) => {
              const referencia = p.persistedId ?? p.id ?? p.code ?? idx
              const estado = p.estado ?? p.status ?? 'Desconocido'
              const qty = p.quantity ?? p.cantidad ?? 0
              return (
                <li key={referencia} className={styles.recentItem}>
                  <div>
                    <strong>{p.name}</strong> <span className={styles.recentMeta}>({p.code ?? '—'})</span>
                    <div className={styles.recentMeta}>
                      {p.type} · {estado}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className={styles.recentQty}>{qty} uds.</div>
                    <div className={styles.recentActions}>
                      <button className="secondary" onClick={() => handleViewProduct(p)}>
                        Ver
                      </button>
                      {canEdit && (
                        <button className="secondary" onClick={() => handleEditProduct(p)}>
                          Editar
                        </button>
                      )}
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
