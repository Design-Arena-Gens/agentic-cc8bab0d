export const metadata = {
  title: 'AI Shopping Assistant',
  description: 'Your personal AI-powered fashion shopping assistant',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
