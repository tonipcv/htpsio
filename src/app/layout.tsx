import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from '@/components/providers'
import { Toaster } from 'sonner'
import { cn } from '@/lib/utils'
import Script from 'next/script'
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Xase',
  description: 'Enterprise Security Platform',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.png', type: 'image/png', sizes: '32x32' },
      { url: '/icon.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    other: [
      {
        rel: 'mask-icon',
        url: '/favicon.svg',
      },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'HTSP - High Ticket Sales Platform',
  },
  openGraph: {
    title: 'HTSP - High Ticket Sales Platform',
    description: 'All-in-one platform for high ticket sales',
    url: 'https://htsp.io',
    siteName: 'HTSP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HTSP - High Ticket Sales Platform',
    description: 'All-in-one platform for high ticket sales',
  },
  keywords: ['medical practice management', 'healthcare platform', 'doctor management system', 'medical scheduling', 'patient management', 'healthcare innovation', 'medical technology', 'TOP1 medical platform']
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script id="google-tag-manager" strategy="beforeInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-WNKND9BM');`}
        </Script>
        <link rel="stylesheet" href="https://fonts.cdnfonts.com/css/sf-pro-display" />
      </head>
      <body className={cn(inter.className, "min-h-screen bg-background")} suppressHydrationWarning>
        <noscript>
          <iframe 
            src="https://www.googletagmanager.com/ns.html?id=GTM-WNKND9BM"
            height="0" 
            width="0" 
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster richColors position="top-right" />
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  )
}
