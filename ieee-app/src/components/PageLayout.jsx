import { motion } from 'framer-motion'

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
}

const pageTransition = {
  type: 'tween',
  ease: 'easeOut',
  duration: 0.4,
}

export default function PageLayout({ children, variant = 'default' }) {
  const isHome = variant === 'home'

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={pageTransition}
      className={
        isHome
          ? ''
          : 'pt-[var(--navbar-height,6rem)]'
      }
    >
      {children}
    </motion.div>
  )
}
