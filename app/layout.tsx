import type { Metadata, Viewport } from 'next'
import { DM_Sans } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans' })

export const metadata: Metadata = {
  title: 'Paso · Tu ayudante de carga',
  description: 'Un papel, tres datos. Probá un ejemplo sencillo para revisar y copiar los datos de tus comprobantes, paso a paso.',
  robots: { index: false, follow: false },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#f6f7fa',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-AR" className={`light bg-background ${dmSans.variable}`}>
      <body className="font-sans antialiased">
        {children}
        <Toaster theme="light" position="bottom-center" />
      </body>
    </html>
  )
}
