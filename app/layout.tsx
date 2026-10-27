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

export const metadata: Metadata = {
  title: "SwissVolt Distribution | Solar Panels, Energy Storage & More",
  description:
    "Central & Eastern European importer and distributor of renewable energy infrastructure, connecting leading Asian manufacturers with European B2B markets.",
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
      className={cn("antialiased", fontMono.variable, "font-sans", archivo.variable)}
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
