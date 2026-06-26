import './globals.css'

export const metadata = {
  title: 'ObservIQ - AI Application Monitoring',
  description: 'Professional AI observability platform',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
