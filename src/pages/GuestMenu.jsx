// src/pages/GuestMenu.jsx
import React, { useEffect, useMemo, useState } from 'react'
import api from '../api'
import styles from './GuestMenu.module.css'

export default function GuestMenu() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [filterType, setFilterType] = useState('')

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError('')

    try {
      api.defaults.headers.common['x-role'] = 'guest'
    } catch (e) {
      console.warn('No se pudo configurar el header x-role para invitado:', e)
    }

    api
      .get('/productos', { headers: { 'x-role': 'guest' } })
      .then((res) => {
        if (!mounted) return
        let list = []
        if (Array.isArray(res.data)) list = res.data
        else if (res.data && Array.isArray(res.data.productos)) list = res.data.productos
        else if (res.data && Array.isArray(res.data.data)) list = res.data.data
        else if (res.data && typeof res.data === 'object') {
          const key = Object.keys(res.data).find((k) => Array.isArray(res.data[k]))
          if (key) list = res.data[key]
        }
        setProducts(list || [])
      })
      .catch((err) => {
        console.error('No se pudo cargar el catálogo público:', err)
        const msg =
          err?.response?.status && err?.response?.statusText
            ? `HTTP ${err.response.status} ${err.response.statusText}`
            : err?.message || 'Error de conexión'
        setError(`No se pudo cargar el catálogo público. ${msg}`)
        setProducts([])
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    const typeNeedle = filterType.trim().toLowerCase()
    return products.filter((p) => {
      const name = String(p.name ?? '').toLowerCase()
      const code = String(p.code ?? '').toLowerCase()
      const type = String(p.type ?? '').toLowerCase()
      const matchesQuery = !needle || name.includes(needle) || code.includes(needle)
      const matchesType = !typeNeedle || type === typeNeedle
      return matchesQuery && matchesType
    })
  }, [products, query, filterType])

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h2>Catálogo público</h2>
        <p>
          Consulta el muestrario oficial de la armería: piezas en exposición, especificaciones principales y stock orientativo para clientes
          invitados.
        </p>
      </header>

      <div className={styles.filters}>
        <input
          aria-label="Buscar productos"
          placeholder="Buscar por nombre o código..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="">Todos los tipos</option>
          <option value="fuego">Fuego</option>
          <option value="blanco">Blanco</option>
          <option value="electro">Electro</option>
        </select>
      </div>

      <section className={`card ${styles.catalogCard}`}>
        {loading && <p className={styles.message}>Cargando catálogo público…</p>}
        {!loading && error && <p className={`${styles.message} ${styles.error}`}>{error}</p>}
        {!loading && !error && filtered.length === 0 && <p className={styles.message}>No hay productos que coincidan con tu búsqueda.</p>}
        {!loading && !error && filtered.length > 0 && (
          <ul className={styles.list}>
            {filtered.map((p, idx) => (
              <li key={p.id ?? p.code ?? idx} className={styles.item}>
                <div>
                  <div className={styles.itemTitle}>
                    {p.name}
                    <small>({p.code ?? '—'})</small>
                  </div>
                  <div className={styles.itemMeta}>
                    {p.type} · {p.estado ?? p.status ?? 'Desconocido'} · {p.quantity ?? 0} uds. disponibles para demostración.
                  </div>
                  {p.description && <div className={styles.itemDescription}>{p.description}</div>}
                </div>
                <div className={styles.itemQty}>{p.quantity ?? 0} uds.</div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
