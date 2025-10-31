import React from 'react'
import styles from './ProductForm.module.css'

export default function ProductForm({
  form,
  editingId,
  canEdit,
  busy,
  error,
  onFieldChange,
  onSubmit,
  onClear,
  onNavigateBack,
}) {
  const isEditing = Boolean(editingId)
  return (
    <form onSubmit={onSubmit} className={`card ${styles.form}`}>
      <h3>{isEditing ? 'Editar producto' : 'Nuevo producto'}</h3>
      <p className={styles.hint}>
        Completa los datos del arma o accesorio. Los campos de tipo y estado deben enviarse en mayúsculas según el control interno.
      </p>
      <label className={styles.label}>
        Código
        <input value={form.code} onChange={(e) => onFieldChange('code', e.target.value)} disabled={!canEdit} />
      </label>
      <label className={styles.label}>
        Nombre
        <input value={form.name} onChange={(e) => onFieldChange('name', e.target.value)} disabled={!canEdit} />
      </label>
      <label className={styles.label}>
        Tipo
        <select value={form.type} onChange={(e) => onFieldChange('type', e.target.value)} disabled={!canEdit}>
          <option value="FUEGO">Fuego</option>
          <option value="BLANCO">Blanco</option>
          <option value="ELECTRO">Electro</option>
        </select>
      </label>
      <label className={styles.label}>
        Calibre
        <input value={form.caliber} onChange={(e) => onFieldChange('caliber', e.target.value)} disabled={!canEdit} />
      </label>
      <label className={styles.label}>
        Cantidad
        <input
          type="number"
          value={form.quantity}
          onChange={(e) => onFieldChange('quantity', Number(e.target.value))}
          disabled={!canEdit}
        />
      </label>
      <label className={styles.label}>
        Estado
        <select value={form.estado} onChange={(e) => onFieldChange('estado', e.target.value)} disabled={!canEdit}>
          <option value="NUEVO">Nuevo</option>
          <option value="USADO">Usado</option>
        </select>
      </label>
      <label className={styles.label}>
        Descripción
        <textarea
          rows={3}
          value={form.description}
          onChange={(e) => onFieldChange('description', e.target.value)}
          disabled={!canEdit}
        />
      </label>
      <div className={styles.actions}>
        <button type="submit" disabled={!canEdit || busy}>
          {busy ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear producto'}
        </button>
        <button type="button" className="secondary" onClick={onClear}>
          Limpiar
        </button>
        <button type="button" className="secondary" onClick={onNavigateBack}>
          Volver
        </button>
      </div>
      {isEditing && (
        <p className={styles.infoText}>
          Editando <strong>{form.code || editingId}</strong>. Pulsa “Limpiar” para volver al modo alta.
        </p>
      )}
      {error && <div className={styles.error}>{error}</div>}
    </form>
  )
}
