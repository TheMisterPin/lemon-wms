'use client'

import React from 'react'

import Link from 'next/link'

import { Box, Menu } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full bg-linear-to-r from-stone-400 to-stone-500 backdrop-blur supports-[backdrop-filter]:bg-background/60  shadow-md shadow-slate-400">
      <div className="container  flex h-14 pl-6 min-w-full">

        <Link href="/" className="flex items-center gap-2 font-semibold text-neutral-200">
          <Box className="h-6 w-6" />
          <span>BoxMas</span>
        </Link>

        <div className="flex flex-1 items-center justify-end ">
          <Button variant="ghost" size="icon" onClick={onMenuClick}>
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
