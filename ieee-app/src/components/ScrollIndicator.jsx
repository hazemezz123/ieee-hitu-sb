import { useLenis } from '../lib/useLenis'

export default function ScrollIndicator() {
  const lenisRef = useLenis()

  function handleClick() {
    if (lenisRef?.current) {
      const hero = document.querySelector('[data-next-section]')
      if (hero) {
        lenisRef.current.scrollTo(hero, { offset: -60 })
      }
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Scroll to next section"
      className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-on-surface-variant/50 transition-all duration-300 ease-out hover:text-primary/70"
    >
      <span className="text-[0.625rem] font-medium uppercase tracking-[0.15em]">
        Scroll
      </span>
      <div className="relative flex flex-col items-center">
        <svg
          width="16"
          height="24"
          viewBox="0 0 16 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="animate-scroll-bounce"
        >
          <rect x="1.5" y="1.5" width="13" height="21" rx="6.5" />
          <circle cx="8" cy="8" r="1.5" className="animate-scroll-dot" />
        </svg>
      </div>
    </button>
  )
}
