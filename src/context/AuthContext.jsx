import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  // On mount, restore session from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('dispatcher_token')
    const savedUser  = localStorage.getItem('dispatcher_user')
    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  // #backend-needed — swap the hardcoded response with real API call
  const login = async (email, password) => {
    // #backend-needed: replace this block with:
    // const res = await api.post('/auth/login', { email, password })
    // const { token, user } = res.data
    throw new Error('backend-needed')
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('dispatcher_token')
    localStorage.removeItem('dispatcher_user')

    // Reset theme on logout
    document.documentElement.setAttribute('data-theme', 'light')
    document.documentElement.classList.remove('dark')
  }

  // Called by login page after successful API response
  const saveSession = (token, user) => {
    setToken(token)
    setUser(user)
    localStorage.setItem('dispatcher_token', token)
    localStorage.setItem('dispatcher_user', JSON.stringify(user))
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, saveSession }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}