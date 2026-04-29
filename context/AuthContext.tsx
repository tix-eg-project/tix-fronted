'use client'
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { setCookie, getCookie, deleteCookie } from 'cookies-next'
import api from '@/lib/api'
import type { User } from '@/lib/types'

type AuthState = {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

type AuthContextType = {
  state: AuthState
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, phone: string, password: string) => Promise<void>
  logout: () => Promise<void>
  updateUser: (user: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

const COOKIE_OPTIONS = { maxAge: 60 * 60 * 24 * 7, path: '/' } // 7 days

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  })

  // Restore session on mount
  useEffect(() => {
    const token = getCookie('auth_token') as string | undefined
    const userData = getCookie('user_data') as string | undefined

    if (token && userData) {
      try {
        const user = JSON.parse(userData)
        setState({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        })
      } catch {
        deleteCookie('auth_token')
        deleteCookie('user_data')
        setState(prev => ({ ...prev, isLoading: false }))
      }
    } else {
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const response = await api.post('/auth/user/login', { email, password })
    const data = response.data

    if (!data.status) {
      throw new Error(data.message || 'فشل تسجيل الدخول')
    }

    const token = data.data?.token || data.token
    const user = data.data?.user || data.user

    setCookie('auth_token', token, COOKIE_OPTIONS)
    setCookie('user_data', JSON.stringify(user), COOKIE_OPTIONS)

    setState({
      user,
      token,
      isAuthenticated: true,
      isLoading: false,
    })
  }, [])

  const register = useCallback(async (name: string, email: string, phone: string, password: string) => {
    const response = await api.post('/auth/user/register', {
      name,
      email,
      phone,
      password,
      password_confirmation: password,
    })

    const data = response.data
    if (!data.status) {
      throw new Error(data.message || 'فشل إنشاء الحساب')
    }

    const token = data.data?.token || data.token
    const user = data.data?.user || data.user

    if (token && user) {
      setCookie('auth_token', token, COOKIE_OPTIONS)
      setCookie('user_data', JSON.stringify(user), COOKIE_OPTIONS)

      setState({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      })
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await api.post('/logout')
    } catch {
      // Ignore logout API errors
    } finally {
      deleteCookie('auth_token')
      deleteCookie('user_data')
      setState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      })
    }
  }, [])

  const updateUser = useCallback((userData: Partial<User>) => {
    setState(prev => {
      if (!prev.user) return prev
      const updatedUser = { ...prev.user, ...userData }
      setCookie('user_data', JSON.stringify(updatedUser), COOKIE_OPTIONS)
      return { ...prev, user: updatedUser }
    })
  }, [])

  return (
    <AuthContext.Provider value={{ state, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
