import React from 'react'
import styles from './ProductCatalog.module.css'

export default function ProductCatalog({
  products,
  loading,
  error,
  query,
  onQueryChange,
  onClearQuery,
  onViewProduct,
}) {
  const hasResults = products.length > 0
  return (
    <div className={`card ${styles.card}`}>
      <div className={styles.searchRow}>
        <input placeholder="Buscar por nombre o código..." value={query} onChange={(e) => onQueryChange(e.target.value)} />
        <button className="secondary" onClick={onClearQuery}>
          Limpiar
        </button>
      </div>

      {loading ? (
        <p className={styles.message}>Cargando catálogo...</p>
      ) : error ? (
        <p className={`${styles.message} ${styles.error}`}>{error}</p>
      ) : !hasResults ? (
        <p className={styles.message}>No hay productos que coincidan.</p>
      ) : (
        <ul className={styles.list}>
          {products.map((p) => (
            <li key={p.id ?? p.code} className={styles.listItem}>
              <div>
                <div className={styles.itemTitle}>
                  {p.name} <small className={styles.itemCode}>({p.code ?? '-'})</small>
                </div>
                <div className={styles.itemMeta}>
                  {p.type} · {p.estado ?? p.status ?? 'Desconocido'} · {p.quantity ?? 0} uds.
                </div>
                {p.description && <div className={styles.itemDescription}>{p.description}</div>}
              </div>
              <div className={styles.itemActions}>
                <div>{p.quantity ?? 0} uds.</div>
                <button className="secondary" onClick={() => onViewProduct(p.id ?? p.code)}>
                  Ver
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
