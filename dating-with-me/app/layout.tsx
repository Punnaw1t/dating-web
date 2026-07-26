import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Date Invite 💌',
  description: 'A special date invitation just for you 🌸',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="dating-with-me/public/cat.jpg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}