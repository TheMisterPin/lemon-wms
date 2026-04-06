import AuthProvider from '@/components/shared/AuthProvider'
import NotificationDialog from '@/components/shared/NotificationDialog'
import type { Metadata } from 'next'

import './globals.css'

export const metadata: Metadata = {
  title: 'Lemon WMS',
  description: 'Warehouse Management System for office and floor operations.'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: '(function(){try{var t=localStorage.getItem(\'theme\');if(t===\'light\'){document.documentElement.classList.remove(\'dark\')}else{document.documentElement.classList.add(\'dark\')}}catch(e){}})();'
          }}
        />
      </head>
      <body className="antialiased">
        <AuthProvider>{children}</AuthProvider>
        <NotificationDialog />
      </body>
    </html>
  )
}
