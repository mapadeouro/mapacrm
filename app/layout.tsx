import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MapaCRM',
  description: 'Prospecção de alta velocidade — Método Mapa de Ouro™',
  manifest: '/manifest.json',
  appleWebApp: {
    capable:          true,
    statusBarStyle:   'black-translucent',
    title:            'MapaCRM',
  },
}

export const viewport: Viewport = {
  width:               'device-width',
  initialScale:        1,
  maximumScale:        1,  // desativa zoom no mobile
  userScalable:        false,
  themeColor:          '#111318',
  viewportFit:         'cover',  // safe area iPhone
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
