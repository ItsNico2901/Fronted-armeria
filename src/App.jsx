// src/App.jsx
import React from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import LoginForm from './pages/LoginForm'
import CargaForm from './pages/CargaForm'
import ProductosGestion from './pages/ProductosGestion'
import UsuariosGestion from './pages/UsuariosGestion'
import ReportesForm from './pages/ReportesForm'
import AdminMenu from './pages/AdminMenu'
import UserMenu from './pages/UserMenu'
import GuestMenu from './pages/GuestMenu'
import NavBar from './components/NavBar'
import { useAuth } from './contexts/AuthContext'
import styles from './App.module.css'

function RequireAuth({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return children
}

function RoleBasedMenu() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  const role = String(user.role ?? '').toUpperCase()

  if (role === 'ADMIN') return <AdminMenu />
  if (role === 'USER') return <UserMenu />
  if (role === 'INVITADO' || role === 'GUEST') return <GuestMenu />
  return <UserMenu />
}

export default function App() {
  const location = useLocation()
  const hideNav = location.pathname === '/'

  return (
    <div className={styles.app}>
      {!hideNav && <NavBar />}
      <main className={styles.main}>
        <Routes>
          <Route path="/" element={<CargaForm />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/guest" element={<GuestMenu />} />
          <Route
            path="/menu"
            element={
              <RequireAuth>
                <RoleBasedMenu />
              </RequireAuth>
            }
          />
          <Route
            path="/productos"
            element={
              <RequireAuth>
                <ProductosGestion />
              </RequireAuth>
            }
          />
          <Route
            path="/usuarios"
            element={
              <RequireAuth>
                <UsuariosGestion />
              </RequireAuth>
            }
          />
          <Route
            path="/reportes"
            element={
              <RequireAuth>
                <ReportesForm />
              </RequireAuth>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}
