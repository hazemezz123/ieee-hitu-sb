import { forwardRef } from 'react'
import { LOGO_ARCH_PATH, LOGO_DIAMOND_PATH } from './logoPaths'

const LogoMark = forwardRef(function LogoMark({ className = '', ...props }, ref) {
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
        fill="#00629b"
        stroke="#00b5e2"
        strokeWidth="6"
        strokeLinejoin="round"
        fillRule="evenodd"
      />
      <path
        data-logo="arch"
        d={LOGO_ARCH_PATH}
        fill="#dcb656"
        stroke="#dcb656"
        strokeWidth="6"
        strokeLinejoin="round"
        fillRule="evenodd"
      />
    </svg>
  )
})

export default LogoMark
