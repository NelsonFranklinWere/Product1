'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
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
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in on app start
    const token = localStorage.getItem('auth_token')
    const savedUser = localStorage.getItem('user')
    
    if (token && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser)
        setUser(parsedUser)
        
        // Verify token with server
        apiClient.getProfile()
          .then((userData) => {
            // Convert id to string if it's a number (backend returns integer)
            const normalizedUser = {
              ...userData,
              id: String(userData.id),
            }
            setUser(normalizedUser as User)
            localStorage.setItem('user', JSON.stringify(normalizedUser))
          })
          .catch(() => {
            // Token invalid, clear storage
            localStorage.removeItem('auth_token')
            localStorage.removeItem('user')
            setUser(null)
          })
          .finally(() => {
            setLoading(false)
          })
      } catch (error) {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user')
        setUser(null)
        setLoading(false)
      }
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const { user: userData, token } = await apiClient.login(email, password)
      // Convert id to string if it's a number (backend returns integer)
      const normalizedUser = {
        ...userData,
        id: String(userData.id),
      }
      setUser(normalizedUser as User)
      localStorage.setItem('auth_token', token)
      localStorage.setItem('user', JSON.stringify(normalizedUser))
      router.push('/')
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 
                           error.response?.data?.message || 
                           error.message || 
                           'Login failed. Please check your credentials.'
      throw new Error(errorMessage)
    }
  }

  const register = async (data: any) => {
    try {
      const { user: userData, token } = await apiClient.register(data)
      // Convert id to string if it's a number (backend returns integer)
      const normalizedUser = {
        ...userData,
        id: String(userData.id),
      }
      setUser(normalizedUser as User)
      localStorage.setItem('auth_token', token)
      localStorage.setItem('user', JSON.stringify(normalizedUser))
      router.push('/')
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 
                           error.response?.data?.message || 
                           error.message || 
                           'Registration failed. Please try again.'
      throw new Error(errorMessage)
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
      router.push('/login')
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
