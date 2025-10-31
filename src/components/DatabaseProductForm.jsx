import React from 'react'
import styles from './DatabaseProductForm.module.css'

export default function DatabaseProductForm({ form, busy, error, success, onFieldChange, onSubmit, onClear }) {
  return (
    <form onSubmit={onSubmit} className={`card ${styles.card}`}>
      <h3>Crear producto en base de datos</h3>
      <p className={styles.note}>Registra piezas directamente en el inventario oficial de la armería.</p>

      <label className={styles.label}>
        Código
        <input name="code" value={form.code} onChange={(e) => onFieldChange('code', e.target.value)} disabled={busy} />
      </label>

      <label className={styles.label}>
        Nombre
        <input name="name" value={form.name} onChange={(e) => onFieldChange('name', e.target.value)} disabled={busy} />
      </label>

      <label className={styles.label}>
        Tipo
        <select name="type" value={form.type} onChange={(e) => onFieldChange('type', e.target.value)} disabled={busy}>
          <option value="FUEGO">Fuego</option>
          <option value="BLANCO">Blanco</option>
          <option value="ELECTRO">Electro</option>
        </select>
      </label>

      <label className={styles.label}>
        Calibre
        <input name="caliber" value={form.caliber} onChange={(e) => onFieldChange('caliber', e.target.value)} disabled={busy} />
      </label>

      <label className={styles.label}>
        Cantidad
        <input
          name="quantity"
          type="number"
          value={form.quantity}
          onChange={(e) => onFieldChange('quantity', Number(e.target.value))}
          disabled={busy}
        />
      </label>

      <label className={styles.label}>
        Estado
        <select name="estado" value={form.estado} onChange={(e) => onFieldChange('estado', e.target.value)} disabled={busy}>
          <option value="NUEVO">Nuevo</option>
          <option value="USADO">Usado</option>
        </select>
      </label>

      <label className={styles.label}>
        Descripción
        <textarea
          name="description"
          value={form.description}
          rows={3}
          onChange={(e) => onFieldChange('description', e.target.value)}
          disabled={busy}
        />
      </label>

      <div className={styles.actions}>
        <button type="submit" disabled={busy}>
          {busy ? 'Guardando...' : 'Guardar en BD'}
        </button>
        <button type="button" className="secondary" onClick={onClear} disabled={busy}>
          Limpiar
        </button>
      </div>

      {error && <p className={styles.error}>{error}</p>}
      {success && <p className={styles.success}>{success}</p>}
    </form>
  )
}
