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
      router.push('/dashboard')
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
      
      // Set state and localStorage first
      setUser(normalizedUser as User)
      localStorage.setItem('auth_token', token)
      localStorage.setItem('user', JSON.stringify(normalizedUser))
      
      console.log('Registration successful:', {
        user: normalizedUser,
        token: token.substring(0, 20) + '...',
        hasToken: !!token
      })
      
      // Small delay to ensure state is updated before redirect
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Redirect to dashboard
      router.push('/dashboard')
    } catch (error: any) {
      // Extract detailed error messages from backend
      let errorMessage = 'Registration failed. Please try again.'
      
      if (error.response?.data) {
        const errorData = error.response.data
        const fieldErrors: string[] = []
        
        // Handle field-specific validation errors
        Object.keys(errorData).forEach((key) => {
          if (Array.isArray(errorData[key])) {
            fieldErrors.push(`${key}: ${errorData[key].join(', ')}`)
          } else if (typeof errorData[key] === 'string') {
            fieldErrors.push(errorData[key])
          } else if (typeof errorData[key] === 'object' && errorData[key] !== null) {
            Object.keys(errorData[key]).forEach((subKey) => {
              if (Array.isArray(errorData[key][subKey])) {
                fieldErrors.push(`${key}.${subKey}: ${errorData[key][subKey].join(', ')}`)
              }
            })
          }
        })
        
        if (fieldErrors.length > 0) {
          errorMessage = fieldErrors.join('. ')
        } else if (errorData.error) {
          errorMessage = errorData.error
        } else if (errorData.message) {
          errorMessage = errorData.message
        } else if (typeof errorData === 'string') {
          errorMessage = errorData
        }
      } else if (error.message) {
        errorMessage = error.message
      }
      
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
