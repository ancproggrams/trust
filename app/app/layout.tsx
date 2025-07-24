
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/auth-context'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
})

export const metadata: Metadata = {
  title: 'ZZP Trust - Premium Dashboard voor ZZP\'ers',
  description: 'Beheer je facturen, klanten, afspraken en documenten met de meest elegante tool voor ZZP\'ers in Nederland.',
  keywords: 'ZZP, freelancer, facturen, dashboard, Nederland',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="nl" className={inter.variable}>
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
