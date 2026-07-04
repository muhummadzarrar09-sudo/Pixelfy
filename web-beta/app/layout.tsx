import type { Metadata } from "next"
import "./globals.css"
import { Toaster } from "sonner"
import { ThemeProvider } from "next-themes"

export const metadata: Metadata = {
  title: "Pixelfy — Beta Pioneers | AI Image Enhancement — On-device",
  description: "Pixelfy Beta — Snapseed speed × Lightroom power × Remini AI — 100% on-device — 63 tools — AGP 9 / Kotlin 2.4 — Auth standby",
  metadataBase: new URL("https://betapixelfy.vercel.app"),
  openGraph: {
    title: "Pixelfy Beta Pioneers",
    description: "Tired of Lightroom $144/yr, Snapseed abandoned, Remini plastic? Join 200 Pioneers.",
    url: "https://betapixelfy.vercel.app",
    siteName: "Pixelfy",
    images: [{ url: "/og-pixelfy.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: { card: "summary_large_image", creator: "@pixelfyapp" },
  icons: { icon: "/favicon.ico" }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className="min-h-screen bg-[#0F0B1A] text-[#FEFCFF] antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {children}
          <Toaster richColors position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  )
}
