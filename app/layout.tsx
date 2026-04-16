import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Финтрек — Личные финансы",
  description: "Учёт доходов, расходов и бюджета",
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" className="h-full">
      <body className="h-full">{children}</body>
    </html>
  )
}
