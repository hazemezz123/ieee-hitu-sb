import { motion } from 'framer-motion'

const defaultVariants = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
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
  const visibilityProps =
    trigger === 'load'
      ? { animate: 'visible' }
      : {
          whileInView: 'visible',
          viewport: { once: true, margin: '-100px', amount: 0.1 },
        }

  return (
    <motion.div
      initial="hidden"
      {...visibilityProps}
      custom={delay}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export default AnimatedSection
