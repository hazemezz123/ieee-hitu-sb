import { useEffect, useRef, useState } from 'react'

const formatDate = date => {
  const parsed = new Date(date)
  return Number.isFinite(parsed.getTime())
    ? parsed.toLocaleDateString('en-US', { dateStyle: 'long', timeZone: 'UTC' })
    : 'Date unavailable'
}

export default function Lightbox({ images, currentIndex, onClose, onNavigate }) {
  const safeImages = images ?? []
  const dialogRef = useRef(null)
  const closeRef = useRef(null)
  const triggerRef = useRef(document.activeElement)
  const overflowRef = useRef(document.body.style.overflow)
  const [failedImage, setFailedImage] = useState(null)
  const image = safeImages[currentIndex]
  const imageIdentity = image && `${currentIndex}:${image.src}`
  const isOpen = Boolean(image)

  useEffect(() => {
    if (!isOpen) return
    const trigger = triggerRef.current
    const previousOverflow = overflowRef.current
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    return () => {
      document.body.style.overflow = previousOverflow
      trigger?.focus()
    }
  }, [isOpen])

  useEffect(() => {
    if (!image) return
    const handleKeyDown = event => {
      if (event.key === 'Escape') onClose()
      if (safeImages.length > 1 && event.key === 'ArrowLeft') onNavigate(-1)
      if (safeImages.length > 1 && event.key === 'ArrowRight') onNavigate(1)
      if (event.key !== 'Tab') return

      const controls = [...(dialogRef.current?.querySelectorAll('button:not([disabled])') || [])]
      const first = controls[0]
      const last = controls.at(-1)
      if (!dialogRef.current?.contains(document.activeElement)) {
        event.preventDefault()
        ;(event.shiftKey ? last : first)?.focus()
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last?.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first?.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [image, onClose, onNavigate, safeImages.length])

  if (!image) return null

  const alt = image.caption || `${image.eventTitle || 'Event'} photo`
  const imageFailed = failedImage === imageIdentity

  return (
    <div ref={dialogRef} className="fixed inset-0 z-50 flex items-center justify-center bg-black/90" role="dialog" aria-modal="true" aria-label={`${image.eventTitle || 'Event'} photo`} onClick={event => event.target === event.currentTarget && onClose()}>
      <button ref={closeRef} type="button" aria-label="Close lightbox" className="absolute right-4 top-4 z-10 min-h-11 min-w-11 p-2 text-white/80 hover:text-white" onClick={onClose}>
        <span className="material-symbols-outlined" aria-hidden="true">close</span>
      </button>

      {safeImages.length > 1 && <button type="button" aria-label="Previous image" className="absolute left-4 z-10 min-h-11 min-w-11 bg-black/40 p-2 text-white/80 hover:text-white" onClick={() => onNavigate(-1)}>
        <span className="material-symbols-outlined text-3xl" aria-hidden="true">chevron_left</span>
      </button>}

      {safeImages.length > 1 && <button type="button" aria-label="Next image" className="absolute right-4 z-10 min-h-11 min-w-11 bg-black/40 p-2 text-white/80 hover:text-white" onClick={() => onNavigate(1)}>
        <span className="material-symbols-outlined text-3xl" aria-hidden="true">chevron_right</span>
      </button>}

      <figure className="flex max-h-[90vh] max-w-5xl flex-col items-center px-4 py-8 sm:px-16" onClick={event => event.stopPropagation()}>
        {imageFailed
          ? <div role="img" aria-label={`${alt} image unavailable`} className="flex min-h-64 w-64 max-w-full items-center justify-center bg-surface-container text-on-surface-variant"><span className="material-symbols-outlined text-5xl" aria-hidden="true">broken_image</span></div>
          : <img src={image.src} alt={alt} className="max-h-[70vh] max-w-full object-contain" onError={() => setFailedImage(imageIdentity)} />}
        <figcaption className="mt-4 max-w-2xl text-center text-white">
          {image.caption && <p>{image.caption}</p>}
          {image.eventTitle && <p className="mt-2 text-sm font-bold">{image.eventTitle}</p>}
          {image.eventDate && <time className="mt-1 block text-sm text-white/70" dateTime={image.eventDate}>{formatDate(image.eventDate)}</time>}
          {safeImages.length > 1 && <p className="mt-2 text-xs text-white/60">{currentIndex + 1} / {safeImages.length}</p>}
        </figcaption>
      </figure>
    </div>
  )
}
