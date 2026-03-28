import type { Metadata } from 'next'

import './globals.css'

export const metadata: Metadata = {
  title: 'Lemon WMS',
  description: 'Warehouse Management System for office and floor operations.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
