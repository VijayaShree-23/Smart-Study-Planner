import { createContext, useContext, useEffect, useState } from 'react'; import api from './api'
const Ctx = createContext(null); export const useAuth = () => useContext(Ctx)
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); const [loading, setLoading] = useState(!!localStorage.getItem('token'))
  useEffect(() => { if (localStorage.getItem('token')) api.get('/auth/me').then(r => setUser(r.data)).catch(() => localStorage.removeItem('token')).finally(() => setLoading(false)) }, [])
  const finish = d => { localStorage.setItem('token', d.token); setUser(d) }
  const login = async b => finish((await api.post('/auth/login', b)).data)
  const register = async b => finish((await api.post('/auth/register', b)).data)
  const logout = () => { localStorage.removeItem('token'); setUser(null) }
  return <Ctx.Provider value={{ user, loading, login, register, logout }}>{children}</Ctx.Provider>
}
