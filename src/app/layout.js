import './globals.css'
import Script from 'next/script'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import LenisProvider from '@/lib/LenisProvider'
import { ThemeProvider } from '@/lib/theme'

const themeInitScript = `(function(){try{var t=localStorage.getItem('ieee-hitu-theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.dataset.theme=t;document.documentElement.style.colorScheme=t}catch(e){}})();`

export const metadata = {
  title: 'IEEE HITU Student Branch',
  description: 'The official IEEE student branch at Heliopolis International Technological University.',
  icons: {
    icon: ['/favicon-96x96.png', '/favicon.svg', '/favicon.ico'],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
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
