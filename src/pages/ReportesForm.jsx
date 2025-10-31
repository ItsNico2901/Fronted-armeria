import React, { useState } from 'react'
import api from '../api'
import styles from './ReportesForm.module.css'

export default function ReportesForm({ className = '' }) {
  const [type, setType] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  async function generate() {
    setLoading(true)
    try {
      const res = await api.get('/productos', { params: type ? { type } : {} })
      setResults(res.data || [])
    } catch (err) {
      const msg = err?.message || err?.response?.data?.msg || 'No se pudo generar el reporte.'
      alert(`Error al generar reporte: ${msg}`)
    } finally {
      setLoading(false)
    }
  }

  const containerClass = [styles.card, className].filter(Boolean).join(' ')

  return (
    <div className={containerClass}>
      <h2>Reportes / Consultas</h2>
      <p className={styles.description}>
        Genera listados rápidos del inventario: filtra por tipo de arma y obtén una visión actualizada del stock para auditorías o consultas
        de clientes.
      </p>
      <label className={styles.label}>
        Tipo:
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">Todos</option>
          <option value="Fuego">Fuego</option>
          <option value="Blanco">Blanco</option>
          <option value="Electro">Electro</option>
        </select>
      </label>
      <div className={styles.actions}>
        <button onClick={generate} disabled={loading}>
          {loading ? 'Generando...' : 'Generar reporte'}
        </button>
      </div>
      <section className={styles.results}>
        <h3>Resultados</h3>
        {results.length === 0 ? (
          <p className={styles.empty}>No hay resultados.</p>
        ) : (
          <ul className={styles.list}>
            {results.map((r) => (
              <li key={r.id || r.code}>
                {r.code} — {r.name} — {r.type} — {r.status}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
