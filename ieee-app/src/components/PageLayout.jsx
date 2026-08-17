import { motion as Motion, useReducedMotion } from 'framer-motion'

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0 },
}

const pageTransition = {
  type: 'tween',
  ease: 'easeOut',
  duration: 0.3,
}

export default function PageLayout({ children, variant = 'default' }) {
  const isHome = variant === 'home'
  const reduceMotion = useReducedMotion()

  return (
    <Motion.div
      initial={reduceMotion ? false : 'initial'}
      animate={reduceMotion ? undefined : 'animate'}
      exit={reduceMotion ? undefined : 'exit'}
      variants={pageVariants}
      transition={pageTransition}
      className={
        isHome
          ? ''
          : 'pt-[var(--navbar-height,6rem)]'
      }
    >
      {children}
    </Motion.div>
  )
}
