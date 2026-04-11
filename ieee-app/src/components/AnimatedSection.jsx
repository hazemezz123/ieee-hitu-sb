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
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px', amount: 0.2 }}
      custom={delay}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export default AnimatedSection
