import localFont from 'next/font/local'

export const inter = localFont({
  src: '../app/fonts/inter-latin-wght-normal.woff2',
  weight: '100 900',
  style: 'normal',
  display: 'swap',
  variable: '--font-inter',
})
