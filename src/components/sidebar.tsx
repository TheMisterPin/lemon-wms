'use client'

import React from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { Building2, Home, LogOut } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useAuth } from '@/hooks'

interface SidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function Sidebar({ open, onOpenChange }: SidebarProps) {
  const { user, logout, isAuthenticated } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    onOpenChange(false)
    router.push('/')
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='items-center'>
        <SheetHeader className='bg-linear-to-l from-slate-200 to-slate-100 w-full '>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-4 py-4">
          {isAuthenticated && (
            <>
              <nav className="flex flex-col gap-2">
                <Link href="/" onClick={() => onOpenChange(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    <Home className="mr-2 h-4 w-4" />
                    Home
                  </Button>
                </Link>
                <Link href="/location" onClick={() => onOpenChange(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    <Building2 className="mr-2 h-4 w-4" />
                    Locations
                  </Button>
                </Link>
              </nav>
              <Separator />
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </>
          )}
          {!isAuthenticated && (
            <p className="text-sm text-muted-foreground">
              Please log in to access the menu.
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
