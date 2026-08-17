import { motion as Motion, useReducedMotion } from 'framer-motion'

const defaultVariants = {
  hidden: {
    opacity: 0,
    y: 12,
  },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.3,
      ease: 'easeOut',
    },
  }),
}

function AnimatedSection({
  children,
  variants = defaultVariants,
  delay = 0,
  className = '',
  trigger = 'inView',
}) {
  const reduceMotion = useReducedMotion()
  const visibilityProps =
    trigger === 'load'
      ? { animate: 'visible' }
      : {
          whileInView: 'visible',
          viewport: { once: true, margin: '-100px', amount: 0.1 },
        }

  return (
    <Motion.div
      initial={reduceMotion ? false : 'hidden'}
      {...(reduceMotion ? {} : visibilityProps)}
      custom={delay}
      variants={variants}
      className={className}
    >
      {children}
    </Motion.div>
  )
}

export default AnimatedSection
