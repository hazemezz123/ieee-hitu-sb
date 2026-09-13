export default function PageLayout({ children, variant = 'default' }) {
  const isHome = variant === 'home'

  return (
    <div className={`page-enter ${isHome ? '' : 'pt-[var(--navbar-height,6rem)]'}`.trim()}>
      {children}
    </div>
  )
}
