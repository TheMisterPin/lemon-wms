
'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

import { useErrorModal } from '@/hooks/ui/error-modal-context'
import api from '@/lib/axios'
import { logger } from '@/utils/logger/client-logger'

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  logoutAllDevices: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const { openModal } = useErrorModal()

  useEffect(() => {
    // Check for stored token on app load
    const token = localStorage.getItem('authToken')

    logger.info('Auth context initializing', {
      tokenExists: !!token,
      tokenPreview: token ? `${token.substring(0, 20)}...` : null,
      pathname: window.location.pathname,
    })

    if (token) {
      // You could validate the token here with the server
      // For now, we'll assume it's valid and extract user info
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        const userData = {
          id: payload.userId,
          email: payload.email,
          name: payload.email, // Using email as name for now
        }
        setUser(userData)

        logger.info('User loaded from token', {
          userId: userData.id,
          email: userData.email,
        })
      } catch (error) {
        logger.error('Failed to parse token - removing it', { error })
        localStorage.removeItem('authToken')
      }
    } else {
      logger.warn('No token found in localStorage on init')
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      logger.info('Login attempt', { email })

      const response = await api.post('/auth/login', { email, password })
      const { user: userData, token } = response.data

      logger.info('Login successful - storing token', {
        userId: userData.id,
        email: userData.email,
        tokenPreview: token ? `${token.substring(0, 20)}...` : null,
      })

      localStorage.setItem('authToken', token)
      setUser(userData)

      // Verify token was stored
      const storedToken = localStorage.getItem('authToken')
      logger.info('Token verification after storage', {
        tokenStored: !!storedToken,
        tokensMatch: storedToken === token,
      })

      return true
    } catch (error) {
      const errorMessage =
        (error as { response?: { data?: { error?: string } } }).response?.data?.error ||
        'Failed to login. Please try again.'
      logger.error('Login failed', { email, error: errorMessage })
      openModal(errorMessage)
      return false
    }
  }

  const logout = async (): Promise<void> => {
    try {
      logger.info('Logout initiated')
      // Call logout API to remove token from database
      await api.post('/auth/logout')
      logger.info('Logout API call successful')
    } catch (error) {
      const errorMessage =
        (error as { response?: { data?: { error?: string } } }).response?.data?.error ||
        'Failed to logout from server. Logging out locally.'
      logger.error('Logout API call failed', { error: errorMessage })
      openModal(errorMessage)
      // Continue with logout even if API fails
    } finally {
      logger.info('Removing token from localStorage')
      localStorage.removeItem('authToken')
      setUser(null)
      logger.info('Logout complete - user cleared')
    }
  }

  const logoutAllDevices = async (): Promise<void> => {
    try {
      // Call logout all devices API
      await api.delete('/auth/logout')
    } catch (error) {
      const errorMessage =
        (error as { response?: { data?: { error?: string } } }).response?.data?.error ||
        'Failed to logout from all devices. Logging out locally.'
      openModal(errorMessage)
      // Continue with logout even if API fails
    } finally {
      localStorage.removeItem('authToken')
      setUser(null)
    }
  }

  const value: AuthContextType = {
    user,
    login,
    logout,
    logoutAllDevices,
    isAuthenticated: !!user,
    loading,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
