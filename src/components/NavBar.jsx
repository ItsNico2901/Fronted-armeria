// src/components/NavBar.jsx
import React from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import styles from './NavBar.module.css'

export default function NavBar() {
  const { user, logout } = useAuth()
  const nav = useNavigate()
  const location = useLocation()

  if (location.pathname === '/login') return null

  const role = String(user?.role ?? '').toUpperCase()

  const commonLinks = [
    { to: '/', label: 'Inicio' },
    { to: '/guest', label: 'Catálogo' },
  ]

  const roleLinks =
    role === 'ADMIN'
      ? [
          { to: '/menu', label: 'Admin' },
          { to: '/usuarios', label: 'Usuarios' },
          { to: '/productos', label: 'Productos' },
          { to: '/reportes', label: 'Reportes' },
        ]
      : role === 'USER'
      ? [
          { to: '/menu', label: 'Panel' },
          { to: '/productos', label: 'Productos' },
          { to: '/reportes', label: 'Reportes' },
        ]
      : []

  const links = [...commonLinks, ...roleLinks]

  return (
    <nav className={styles.nav}>
      <div className={styles.links}>
        <span className={styles.brand}>Armería</span>
        {links.map(({ to, label }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `${styles.link}${isActive ? ` ${styles.active}` : ''}`}>
            {label}
          </NavLink>
        ))}
      </div>
      <div className={styles.actions}>
        {user ? (
          <button
            className={styles.logout}
            onClick={() => {
              logout()
              nav('/login')
            }}
          >
            Cerrar sesión
          </button>
        ) : (
          <Link to="/login" className={styles.link}>
            Entrar
          </Link>
        )}
      </div>
    </nav>
  )
}
