import type { Metadata } from "next"
import { Archivo, JetBrains_Mono } from "next/font/google"

import "lenis/dist/lenis.css"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { SmoothScroll } from "@/components/smooth-scroll"
import { cn } from "@/lib/utils"

const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-sans",
})

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

// Where this build is served: an explicit NEXT_PUBLIC_SITE_URL, else the
// project's production domain on Vercel, else localhost. Pointing at a domain
// that doesn't serve this app breaks link previews (no image found).
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000")

const title = "SwissVolt Distribution | Solar Panels, Energy Storage & More"
const description =
  "Central & Eastern European importer and distributor of renewable energy infrastructure, connecting leading Asian manufacturers with European B2B markets."

export const metadata: Metadata = {
  // Link previews need absolute URLs; app/opengraph-image.tsx supplies the image.
  metadataBase: new URL(siteUrl),
  title,
  description,
  openGraph: {
    type: "website",
    siteName: "SwissVolt Distribution",
    locale: "en",
    url: "/",
    title,
    description,
  },
  twitter: { card: "summary_large_image", title, description },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        archivo.variable
      )}
    >
      {/* Browser extensions inject attributes on <body>; ignore those mismatches. */}
      <body suppressHydrationWarning>
        <ThemeProvider forcedTheme="dark">
          <SmoothScroll>{children}</SmoothScroll>
        </ThemeProvider>
      </body>
    </html>
  )
}
