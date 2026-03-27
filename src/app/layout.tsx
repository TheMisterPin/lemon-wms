
import { Maven_Pro } from 'next/font/google'

import './globals.css'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from '@/hooks'
import { ErrorModalProvider } from '@/hooks'

import { ErrorModal } from '../components/error-modal'
import { LayoutWrapper } from '../components/layout-wrapper'

import type { Metadata } from 'next'
const mavenPro = Maven_Pro({
  variable: '--font-maven-pro',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Boxmas',
  description: 'Manage your boxes with ease',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${mavenPro.variable} antialiased flex min-h-screen flex-col`}
      >
        <TooltipProvider>
          <ErrorModalProvider>
            <AuthProvider>
              <LayoutWrapper>{children}</LayoutWrapper>
              <ErrorModal />
            </AuthProvider>
          </ErrorModalProvider>
        </TooltipProvider>
      </body>
    </html>
  )
}
