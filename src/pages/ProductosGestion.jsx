import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../api'
import ProductForm from '../components/ProductForm'
import ProductsTable from '../components/ProductsTable'
import styles from './ProductosGestion.module.css'

function newEmptyProduct() {
  return {
    id: `s_${Date.now()}`,
    code: '',
    name: '',
    type: 'FUEGO',
    estado: 'NUEVO',
    caliber: '',
    quantity: 0,
    description: '',
    persistedId: null,
  }
}

export default function ProductosGestion() {
  const { user } = useAuth()
  const role = String(user?.role || '').toUpperCase()
  const canEdit = role === 'ADMIN' || role === 'USER' || role === 'USUARIO'
  const nav = useNavigate()
  const [form, setForm] = useState(newEmptyProduct())
  const [editingId, setEditingId] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [products, setProducts] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [listError, setListError] = useState('')

  const normalizeProduct = useCallback((raw) => {
    const typeValue = String(raw?.type ?? raw?.tipo ?? 'FUEGO').toUpperCase() || 'FUEGO'
    const estadoValue = String(raw?.estado ?? raw?.status ?? 'NUEVO').toUpperCase() || 'NUEVO'
    const fallbackId = `remote_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    const remoteCode = raw?.code ?? raw?.codigo ?? null
    const remoteId = raw?.id ?? raw?.productoId ?? null
    const reference = remoteCode ?? remoteId ?? raw?.persistedId ?? fallbackId
    const displayId = remoteId ?? remoteCode ?? reference
    return {
      id: displayId,
      code: remoteCode ?? '',
      name: raw?.name ?? raw?.nombre ?? '',
      type: typeValue,
      tipo: typeValue,
      estado: estadoValue,
      status: estadoValue,
      caliber: raw?.caliber ?? raw?.calibre ?? '',
      quantity: Number(raw?.quantity ?? raw?.cantidad ?? 0),
      description: raw?.description ?? raw?.descripcion ?? '',
      persistedId: reference,
    }
  }, [])

  const fetchProducts = useCallback(async () => {
    setLoadingProducts(true)
    try {
      setListError('')
      const res = await api.get('/productos')
      const payload = res?.data
      const list = Array.isArray(payload) ? payload : Array.isArray(payload?.items) ? payload.items : []
      setProducts(list.map((item) => normalizeProduct(item)))
    } catch (err) {
      console.warn('No se pudo obtener la lista de productos:', err)
      const details = err?.response?.data
      const msg =
        details?.message ||
        details?.msg ||
        details?.error ||
        (typeof details === 'string' ? details : '') ||
        err?.message ||
        'No se pudieron obtener los productos.'
      setListError(msg)
    } finally {
      setLoadingProducts(false)
    }
  }, [normalizeProduct])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const handleFieldChange = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }, [])

  function clearForm() {
    setForm(newEmptyProduct())
    setEditingId(null)
  }

  function startEdit(p) {
    setForm({
      ...p,
      type: String(p.type ?? '').toUpperCase() || 'FUEGO',
      estado: String(p.estado ?? p.status ?? '').toUpperCase() || 'NUEVO',
      quantity: Number(p.quantity) || 0,
      persistedId: p.persistedId ?? p.id ?? p.code ?? null,
    })
    setEditingId(p.persistedId ?? p.id ?? p.code ?? null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const code = form.code.trim()
    const name = form.name.trim()
    if (!code || !name) {
      alert('Código y nombre obligatorios')
      return
    }
    setBusy(true)
    try {
      setError('')
      const typeValue = String(form.type ?? form.tipo ?? '').toUpperCase()
      const estadoValue = String(form.estado ?? form.status ?? '').toUpperCase()
      const payload = {
        code,
        name,
        type: typeValue || 'FUEGO',
        caliber: form.caliber ? form.caliber.trim() : null,
        quantity: Number(form.quantity) || 0,
        estado: estadoValue || 'NUEVO',
        description: form.description ? form.description.trim() : null,
      }

      if (!editingId) {
        await api.post('/productos', payload, {
          headers: { 'Content-Type': 'application/json' },
          transformRequest: [
            (data, headers) => {
              headers['Content-Type'] = 'application/json'
              return JSON.stringify(data)
            },
          ],
        })
      } else {
        const original =
          products.find(
            (p) =>
              String(p.id) === String(editingId) ||
              String(p.persistedId) === String(editingId) ||
              (p.code && String(p.code) === String(editingId)),
          ) ?? null
        const reference = original?.persistedId ?? original?.code ?? original?.id ?? editingId
        if (reference) {
          await api.put(`/productos/${reference}`, payload, {
            headers: { 'Content-Type': 'application/json' },
            transformRequest: [
              (data, headers) => {
                headers['Content-Type'] = 'application/json'
                return JSON.stringify(data)
              },
            ],
          })
        }
      }
      await fetchProducts()
      clearForm()
    } catch (err) {
      const details = err?.response?.data
      console.warn('No se pudo persistir producto en backend:', details || err)
      let msg =
        details?.message ||
        details?.msg ||
        details?.error ||
        (typeof details === 'string' ? details : '') ||
        err?.message ||
        'No se pudo guardar el producto en backend.'
      if (details && typeof details === 'object') {
        const extra = JSON.stringify(details)
        if (!msg.includes(extra)) {
          msg += ` — ${extra}`
        }
      }
      setError(msg)
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar producto?')) return
    const p =
      products.find(
        (x) => String(x.id) === String(id) || String(x.persistedId) === String(id) || String(x.code) === String(id),
      ) ?? null
    if (!p) return
    const reference = p.persistedId ?? p.code ?? p.id
    if (reference) {
      try {
        await api.delete(`/productos/${reference}`)
      } catch (err) {
        const msg =
          err?.response?.data?.message || err?.response?.data?.msg || err?.message || 'No se pudo borrar el producto en backend.'
        console.warn('No se pudo borrar en backend:', err)
        setError(msg)
        return
      }
    }
    setError('')
    await fetchProducts()
    if (
      editingId &&
      (String(editingId) === String(id) ||
        String(editingId) === String(p.persistedId) ||
        String(editingId) === String(p.code))
    ) {
      clearForm()
    }
  }

  function formatLabel(value) {
    if (!value) return ''
    const lower = String(value).toLowerCase()
    return lower.charAt(0).toUpperCase() + lower.slice(1)
  }

  return (
    <div className={styles.container}>
      <h2>Gestión de Productos</h2>
      <p className={styles.note}>
        Administra el inventario del arsenal: registra armas, calibres y accesorios disponibles para venta o arriendo. Recuerda que los campos
        de <strong>Tipo</strong> y <strong>Estado</strong> deben enviarse en mayúsculas para cumplir la normativa interna.
      </p>
      <div className={styles.navigateButton}>
        <button className="secondary" onClick={() => nav('/menu')}>
          Regresar al puesto de mando
        </button>
      </div>
      <div className={styles.layout}>
        <ProductForm
          form={form}
          editingId={editingId}
          canEdit={canEdit}
          busy={busy}
          error={error}
          onFieldChange={handleFieldChange}
          onSubmit={handleSubmit}
          onClear={clearForm}
          onNavigateBack={() => nav('/menu')}
        />
        <ProductsTable
          title="Inventario (base de datos)"
          loading={loadingProducts}
          error={listError}
          products={products}
          canEdit={canEdit}
          onEdit={startEdit}
          onDelete={handleDelete}
          formatLabel={formatLabel}
        />
      </div>
    </div>
  )
}
