import './globals.css'
import Script from 'next/script'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import LenisProvider from '@/lib/LenisProvider'
import { ThemeProvider } from '@/lib/theme'
import { inter } from '@/lib/fonts'
import { siteConfig } from '@/lib/seo'
import JsonLd from '@/components/seo/JsonLd'
import { buildOrganizationJsonLd, buildWebSiteJsonLd } from '@/lib/structuredData'

const themeInitScript = `(function(){try{var t=localStorage.getItem('ieee-hitu-theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.dataset.theme=t;document.documentElement.style.colorScheme=t}catch(e){}})();`

export const viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
}

export const metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: {
    default: siteConfig.defaultTitle,
    template: siteConfig.titleTemplate,
  },
  description: siteConfig.description,
  keywords: [
    'IEEE',
    'IEEE HITU',
    'Heliopolis International Technological University',
    'student branch',
    'engineering',
    'workshops',
    'technical committees',
    'events',
  ],
  authors: [{ name: 'IEEE HITU Student Branch' }],
  creator: 'IEEE HITU Student Branch',
  publisher: 'IEEE HITU Student Branch',
  category: 'technology',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: siteConfig.locale,
    siteName: siteConfig.name,
    title: siteConfig.defaultTitle,
    description: siteConfig.description,
    images: [
      {
        url: siteConfig.ogImage,
        alt: 'IEEE HITU Student Branch',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.defaultTitle,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: ['/favicon-96x96.png', '/favicon.svg', '/favicon.ico'],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={inter.className}>
        <JsonLd data={[buildOrganizationJsonLd(), buildWebSiteJsonLd()]} />
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-7FMS8J5THQ" />
        <Script id="gtag-init">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-7FMS8J5THQ')`}
        </Script>
        <ThemeProvider>
          <LenisProvider>
            <Navbar />
            <main>{children}</main>
            <Footer />
          </LenisProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
