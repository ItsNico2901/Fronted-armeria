// src/pages/UserMenu.jsx
import React, { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import api from '../api'
import { useNavigate } from 'react-router-dom'
import ProductCatalog from '../components/ProductCatalog'
import DatabaseProductForm from '../components/DatabaseProductForm'
import SessionProductPanel from '../components/SessionProductPanel'
import ReportesForm from './ReportesForm'
import styles from './UserMenu.module.css'

const newDbProductForm = () => ({
  code: '',
  name: '',
  type: 'FUEGO',
  caliber: '',
  quantity: 1,
  estado: 'NUEVO',
  description: '',
})

const newSessionProductForm = () => ({
  code: '',
  name: '',
  type: 'Fuego',
  quantity: 1,
  estado: 'Nuevo',
  description: '',
})

export default function UserMenu() {
  const { user, sessionProducts, addSessionProduct, removeSessionProduct } = useAuth()
  const navigate = useNavigate()

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [q, setQ] = useState('')

  const [sessionForm, setSessionForm] = useState(() => newSessionProductForm())
  const [dbForm, setDbForm] = useState(() => newDbProductForm())
  const [dbBusy, setDbBusy] = useState(false)
  const [dbError, setDbError] = useState('')
  const [dbSuccess, setDbSuccess] = useState('')

  const role = String(user?.role ?? '').toUpperCase()

  const loadProducts = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/productos')
      let list = []
      if (Array.isArray(res.data)) list = res.data
      else if (res.data && Array.isArray(res.data.productos)) list = res.data.productos
      else if (res.data && Array.isArray(res.data.data)) list = res.data.data
      else if (res.data && typeof res.data === 'object') {
        const key = Object.keys(res.data).find((k) => Array.isArray(res.data[k]))
        if (key) list = res.data[key]
      }
      setProducts(list || [])
    } catch (err) {
      console.error('GET /productos error:', err)
      setError('No se pudo cargar el catálogo. Revisa la API o la cabecera x-role.')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  const filtered = products.filter((p) => {
    if (!q) return true
    const needle = q.toLowerCase()
    return (
      String(p.name ?? '')
        .toLowerCase()
        .includes(needle) ||
      String(p.code ?? '')
        .toLowerCase()
        .includes(needle)
    )
  })

  const handleSessionFieldChange = useCallback((field, value) => {
    setSessionForm((prev) => ({ ...prev, [field]: value }))
  }, [])

  const handleDbFieldChange = useCallback((field, value) => {
    setDbForm((prev) => ({ ...prev, [field]: value }))
  }, [])

  const resetSessionForm = useCallback(() => setSessionForm(newSessionProductForm()), [])
  const resetDbForm = useCallback(() => setDbForm(newDbProductForm()), [])
  const clearDbFeedback = useCallback(() => {
    setDbError('')
    setDbSuccess('')
  }, [])
  const handleDbClear = useCallback(() => {
    resetDbForm()
    clearDbFeedback()
  }, [resetDbForm, clearDbFeedback])

  function addLocal() {
    if (!sessionForm.name || !sessionForm.code) return alert('Código y nombre obligatorios')
    const id = `s_${Date.now()}`
    addSessionProduct({ id, ...sessionForm })
    resetSessionForm()
  }

  async function createDbProduct(e) {
    e.preventDefault()
    const code = dbForm.code.trim()
    const name = dbForm.name.trim()
    if (!code || !name) {
      alert('Código y nombre obligatorios')
      return
    }

    setDbBusy(true)
    clearDbFeedback()
    const payload = {
      code,
      name,
      type: (dbForm.type || 'FUEGO').toUpperCase(),
      caliber: dbForm.caliber ? dbForm.caliber.trim() : null,
      quantity: Number(dbForm.quantity) || 0,
      estado: (dbForm.estado || 'NUEVO').toUpperCase(),
      description: dbForm.description ? dbForm.description.trim() : null,
    }

    try {
      await api.post('/productos', payload, {
        headers: { 'Content-Type': 'application/json' },
        transformRequest: [
          (data, headers) => {
            headers['Content-Type'] = 'application/json'
            return JSON.stringify(data)
          },
        ],
      })
      setDbSuccess('Producto almacenado correctamente en la base de datos.')
      resetDbForm()
      await loadProducts()
    } catch (err) {
      console.error('POST /productos error:', err)
      const details = err?.response?.data
      const msg =
        details?.message ||
        details?.msg ||
        details?.error ||
        (typeof details === 'string' ? details : '') ||
        err?.message ||
        'No se pudo guardar el producto.'
      setDbError(msg)
    } finally {
      setDbBusy(false)
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h2>Panel operativo</h2>
        <p className={styles.userInfo}>
          Usuario: <strong>{user?.username ?? '—'}</strong> — Rol: <em>{user?.role ?? '—'}</em>
        </p>
        <p className={styles.userInfo}>
          Desde aquí puedes registrar nuevas piezas, preparar pedidos y generar reportes para el armero responsable.
        </p>
        <div className={styles.createButton}>
          <button className="secondary" onClick={() => navigate('/productos')}>
            Abrir gestor de inventario
          </button>
        </div>
      </header>

      <div className={styles.content}>
        <ProductCatalog
          products={filtered}
          loading={loading}
          error={error}
          query={q}
          onQueryChange={setQ}
          onClearQuery={() => setQ('')}
          onViewProduct={(id) => navigate(`/productos?id=${encodeURIComponent(id)}`)}
        />

        <aside className={styles.aside}>
          {role === 'USER' && (
            <DatabaseProductForm
              form={dbForm}
              busy={dbBusy}
              error={dbError}
              success={dbSuccess}
              onFieldChange={handleDbFieldChange}
              onSubmit={createDbProduct}
              onClear={handleDbClear}
            />
          )}

          {role === 'USER' && (
            <SessionProductPanel
              form={sessionForm}
              onFieldChange={handleSessionFieldChange}
              onAdd={addLocal}
              sessionProducts={sessionProducts}
              onRemove={removeSessionProduct}
              onNavigateProductos={() => navigate('/productos')}
            />
          )}

          <div className={styles.reportsWrapper}>
            <ReportesForm className={styles.reportsCard} />
            <button className="secondary" onClick={() => navigate('/reportes')}>
              Abrir sección de reportes
            </button>
          </div>
        </aside>
      </div>
    </div>
  )
}
