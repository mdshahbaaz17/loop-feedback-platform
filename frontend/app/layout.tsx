// frontend/app/layout.tsx
import './globals.css'

export const metadata = {
  title: 'LOOP | Customer Feedback Intelligence Platform',
  description: 'Enterprise feedback tracking and sentiment classification platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 antialiased font-sans min-h-screen">
        {children}
      </body>
    </html>
  )
}