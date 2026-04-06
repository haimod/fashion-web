import React from 'react'
import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

export default function AdminRoute({ children }) {
  const { user } = useSelector(s => s.auth)
  return user?.role === 'admin' ? children : <Navigate to='/' replace />
}
