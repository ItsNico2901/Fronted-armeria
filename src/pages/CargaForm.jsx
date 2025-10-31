// src/pages/CargaForm.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './CargaForm.module.css'

export default function CargaForm() {
  const [progress, setProgress] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    let mounted = true
    const totalMs = 4000
    const steps = 100
    const intervalMs = Math.round(totalMs / steps)
    let current = 0

    const id = setInterval(() => {
      current += 1
      if (!mounted) return
      setProgress(current)
      if (current >= steps) {
        clearInterval(id)
        setTimeout(() => {
          if (mounted) navigate('/login', { replace: true })
        }, 150)
      }
    }, intervalMs)

    return () => {
      mounted = false
      clearInterval(id)
    }
  }, [navigate])

  const capped = Math.min(100, Math.max(0, progress))

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <h2>Iniciando Armería</h2>
        <p>
          Ajustando cerrojos, verificando inventario y preparando los accesos seguros. Este chequeo inicial garantiza que
          cada pieza del arsenal esté registrada antes de abrir el panel.
        </p>
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={capped}
          className={styles.progressTrack}
        >
          <div className={styles.progressBar} style={{ width: `${capped}%` }} />
        </div>
        <div className={styles.progressValue}>{capped}%</div>
        <div className={styles.helper}>En cuanto terminemos la revisión, te redirigiremos al acceso principal.</div>
      </div>
    </div>
  )
}
