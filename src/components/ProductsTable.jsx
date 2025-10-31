import React from 'react'
import styles from './ProductsTable.module.css'

export default function ProductsTable({
  title,
  loading,
  error,
  products,
  canEdit,
  onEdit,
  onDelete,
  formatLabel,
}) {
  return (
    <section className={`card ${styles.card}`}>
      <h3>{title}</h3>
      {loading ? (
        <p className={styles.message}>Cargando productos...</p>
      ) : error ? (
        <p className={`${styles.message} ${styles.error}`}>{error}</p>
      ) : products.length === 0 ? (
        <p className={styles.message}>No hay productos registrados en la base de datos.</p>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Estado</th>
                <th className={styles.alignRight}>Cantidad</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, idx) => (
                <tr key={p.id ?? idx} className={idx % 2 === 1 ? styles.altRow : undefined}>
                  <td>{p.code}</td>
                  <td>{p.name}</td>
                  <td>{formatLabel(p.type)}</td>
                  <td>{formatLabel(p.estado ?? p.status)}</td>
                  <td className={styles.alignRight}>{p.quantity}</td>
                  <td className={styles.actionsCell}>
                    {canEdit && (
                      <>
                        <button className="secondary" onClick={() => onEdit(p)}>
                          Editar
                        </button>
                        <button onClick={() => onDelete(p.id ?? p.persistedId ?? p.code)} className={styles.deleteButton}>
                          Eliminar
                        </button>
                      </>
                    )}
                    {p.persistedId && (
                      <span className={styles.remoteId}>
                        ID remoto: <strong>{p.persistedId}</strong>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
