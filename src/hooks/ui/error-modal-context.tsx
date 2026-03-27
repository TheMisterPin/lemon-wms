'use client'
import React, { createContext, useContext, useState } from 'react'

interface ErrorModalContextType {
  openModal: (message: string) => void;
  closeModal: () => void;
  isOpen: boolean;
  message: string | null;
}

const ErrorModalContext = createContext<ErrorModalContextType | undefined>(undefined)

export const ErrorModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const openModal = (msg: string) => {
    setMessage(msg)
    setIsOpen(true)
  }

  const closeModal = () => {
    setIsOpen(false)
    setMessage(null)
  }

  return (
    <ErrorModalContext.Provider value={{ openModal, closeModal, isOpen, message }}>
      {children}
    </ErrorModalContext.Provider>
  )
}

export const useErrorModal = () => {
  const context = useContext(ErrorModalContext)
  if (!context) {
    throw new Error('useErrorModal must be used within ErrorModalProvider')
  }
  return context
}
