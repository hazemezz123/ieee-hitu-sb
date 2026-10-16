import { forwardRef } from 'react'
import { LOGO_ARCH_PATH, LOGO_DIAMOND_PATH } from './logoPaths'

const LOGO_TREATMENTS = {
  color: { diamond: '#0e487f', arch: '#dcb656' },
  white: { diamond: '#ffffff', arch: '#ffffff' },
}

const LogoMark = forwardRef(function LogoMark({ className = '', variant = 'color', ...props }, ref) {
  const colors = LOGO_TREATMENTS[variant] || LOGO_TREATMENTS.color
  return (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1095 1095"
      role="img"
      aria-label="IEEE HITU Student Branch logo"
      className={className}
      {...props}
    >
      <title>IEEE HITU Student Branch logo</title>
      <path
        data-logo="diamond"
        d={LOGO_DIAMOND_PATH}
        fill={colors.diamond}
        stroke={colors.diamond}
        strokeWidth="0.25"
        strokeLinejoin="round"
        fillRule="evenodd"
      />
      <path
        data-logo="arch"
        d={LOGO_ARCH_PATH}
        fill={colors.arch}
        stroke={colors.arch}
        strokeWidth="0.25"
        strokeLinejoin="round"
        fillRule="evenodd"
      />
    </svg>
  )
})

export default LogoMark
