import './globals.css'

export const metadata = {
  title: 'Data Dogs Mission Control',
  description: 'Command Center for Data Dogs Operations',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-bg-primary min-h-screen gradient-mesh grid-bg">
        {children}
      </body>
    </html>
  )
}
