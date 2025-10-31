import React from 'react'
import styles from './SessionProductPanel.module.css'

export default function SessionProductPanel({
  form,
  onFieldChange,
  onAdd,
  sessionProducts,
  onRemove,
  onNavigateProductos,
}) {
  return (
    <div className={`card ${styles.card}`}>
      <h3>Registrar producto (sesión)</h3>
      <p className={styles.hint}>Utiliza esta sección para preparar borradores antes de confirmarlos en la base central.</p>

      <label className={styles.label}>
        Código
        <input name="code" value={form.code} onChange={(e) => onFieldChange('code', e.target.value)} />
      </label>

      <label className={styles.label}>
        Nombre
        <input name="name" value={form.name} onChange={(e) => onFieldChange('name', e.target.value)} />
      </label>

      <label className={styles.label}>
        Tipo
        <select name="type" value={form.type} onChange={(e) => onFieldChange('type', e.target.value)}>
          <option>Fuego</option>
          <option>Blanco</option>
          <option>Electro</option>
        </select>
      </label>

      <label className={styles.label}>
        Cantidad
        <input
          name="quantity"
          type="number"
          value={form.quantity}
          onChange={(e) => onFieldChange('quantity', Number(e.target.value))}
        />
      </label>

      <label className={styles.label}>
        Estado
        <select name="estado" value={form.estado} onChange={(e) => onFieldChange('estado', e.target.value)}>
          <option>Nuevo</option>
          <option>Usado</option>
        </select>
      </label>

      <label className={styles.label}>
        Descripción
        <textarea name="description" value={form.description} onChange={(e) => onFieldChange('description', e.target.value)} />
      </label>

      <div className={styles.actions}>
        <button type="button" onClick={onAdd}>
          Agregar (sesión)
        </button>
        <button type="button" className="secondary" onClick={onNavigateProductos}>
          Ir a productos
        </button>
      </div>

      <div className={styles.sessionList}>
        <h4>Productos de esta sesión</h4>
        {sessionProducts?.length ? (
          <ul className={styles.list}>
            {sessionProducts.map((sp) => (
              <li key={sp.id} className={styles.listItem}>
                <div>
                  <strong>{sp.name}</strong>
                  <div className={styles.listMeta}>
                    {sp.code} · {sp.quantity} uds.
                  </div>
                </div>
                <button className="secondary" onClick={() => onRemove(sp.id)}>
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className={styles.empty}>No hay productos en esta sesión.</div>
        )}
      </div>
    </div>
  )
}
