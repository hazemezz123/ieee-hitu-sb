import { useContext } from 'react'
import { LenisContext } from './lenisContext'

export function useLenis() {
  return useContext(LenisContext)
}
