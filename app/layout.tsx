import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Aviation Jobs CRM',
  description: 'Track aviation job applications across Delta Air Lines, Nicholas Air, Asian Pilots, and more',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased bg-gray-950 text-gray-100">
        {children}
      </body>
    </html>
  )
}
