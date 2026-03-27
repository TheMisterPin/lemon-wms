'use client'

import React, { useState } from 'react'

import { Footer } from './footer'
import { Header } from './header'
import { Sidebar } from './sidebar'

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen flex-col bg-gray-100">
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
      <main className="bg-linear-to-r from-gray-200 to-slate-200  flex flex-1 ">{children}</main>
      <Footer />
    </div>
  )
}
