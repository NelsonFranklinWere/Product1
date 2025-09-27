'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@/types'
import apiClient from '@/lib/api'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: any) => Promise<void>
  logout: () => Promise<void>
  updateUser: (user: User) => void
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in on app start
    const token = localStorage.getItem('auth_token')
    const savedUser = localStorage.getItem('user')
    
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser))
        // Optionally verify token with server
        apiClient.getProfile().then((userData) => {
          setUser(userData)
          localStorage.setItem('user', JSON.stringify(userData))
        }).catch(() => {
          // Token invalid, clear storage
          localStorage.removeItem('auth_token')
          localStorage.removeItem('user')
          setUser(null)
        })
      } catch (error) {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user')
        setUser(null)
      }
    }
    
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const { user: userData, token } = await apiClient.login(email, password)
      setUser(userData)
      localStorage.setItem('auth_token', token)
      localStorage.setItem('user', JSON.stringify(userData))
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Login failed')
    }
  }

  const register = async (data: any) => {
    try {
      const { user: userData, token } = await apiClient.register(data)
      setUser(userData)
      localStorage.setItem('auth_token', token)
      localStorage.setItem('user', JSON.stringify(userData))
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Registration failed')
    }
  }

  const logout = async () => {
    try {
      await apiClient.logout()
    } catch (error) {
      // Continue with logout even if API call fails
    } finally {
      setUser(null)
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
    }
  }

  const updateUser = (userData: User) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    register,
    logout,
    updateUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
