import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null)
  const [admin, setAdmin] = useState(null)
  const [city, setCity] = useState(null)

  useEffect(() => {
    const t = localStorage.getItem('admin_token')
    const a = localStorage.getItem('admin_info')
    const c = localStorage.getItem('admin_city')
    if (t) setToken(t)
    if (a) setAdmin(JSON.parse(a))
    if (c) setCity(JSON.parse(c))
  }, [])

  const login = (token, admin, city) => {
    setToken(token)
    setAdmin(admin)
    setCity(city)
    localStorage.setItem('admin_token', token)
    localStorage.setItem('admin_info', JSON.stringify(admin))
    if (city) localStorage.setItem('admin_city', JSON.stringify(city))
  }

  const updateCity = (patch) => {
    setCity((prev) => {
      const next = { ...(prev || {}), ...(patch || {}) }
      localStorage.setItem('admin_city', JSON.stringify(next))
      return next
    })
  }

  const logout = () => {
    setToken(null)
    setAdmin(null)
    setCity(null)
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_info')
    localStorage.removeItem('admin_city')
  }

  return (
    <AuthContext.Provider value={{ token, admin, city, login, logout, updateCity }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
