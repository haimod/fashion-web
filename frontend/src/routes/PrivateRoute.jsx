import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'

export default function PrivateRoute() {
  const { isAuthenticated } = useSelector(s => s.auth)
  return isAuthenticated ? <Outlet /> : <Navigate to='/login' replace />
}
