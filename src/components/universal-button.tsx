'use client'

import React from 'react'

import { LucideIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'

export interface UniversalButtonProps {
  type: 'full' | 'icon' | 'simple';
  text: string;
  icon: LucideIcon;
  onClick: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

export const UniversalButton: React.FC<UniversalButtonProps> = ({
  type,
  text,
  icon: Icon,
  onClick,
  variant = 'default'
}) => {
  const renderContent = () => {
    switch (type) {
    case 'full':
      return (
        <>
          <Icon />
          {text}
        </>
      )
    case 'icon':
      return <Icon />
    case 'simple':
      return text
    default:
      return text
    }
  }

  const getSize = () => {
    switch (type) {
    case 'icon':
      return 'icon'
    default:
      return 'default'
    }
  }

  return (
    <Button size={getSize()} variant={variant} onClick={onClick}>
      {renderContent()}
    </Button>
  )
}
