import { useEffect, useCallback } from 'react';

function ChevronLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

export default function Lightbox({ images, currentIndex, onClose, onNavigate }) {
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onNavigate(-1);
      if (e.key === 'ArrowRight') onNavigate(1);
    },
    [onClose, onNavigate],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  const image = images[currentIndex];
  if (!image) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      role="dialog"
      aria-modal="true"
      aria-label="Image lightbox"
      onClick={onClose}
    >
      <button
        type="button"
        aria-label="Close lightbox"
        className="absolute top-4 right-4 z-10 text-white/80 hover:text-white transition-colors p-2"
        onClick={onClose}
      >
        <CloseIcon />
      </button>

      {images.length > 1 && (
        <button
          type="button"
          aria-label="Previous image"
          className="absolute left-4 z-10 text-white/80 hover:text-white transition-colors p-2 bg-black/40 rounded-full hover:bg-black/60"
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(-1);
          }}
        >
          <ChevronLeftIcon />
        </button>
      )}

      {images.length > 1 && (
        <button
          type="button"
          aria-label="Next image"
          className="absolute right-4 z-10 text-white/80 hover:text-white transition-colors p-2 bg-black/40 rounded-full hover:bg-black/60"
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(1);
          }}
        >
          <ChevronRightIcon />
        </button>
      )}

      <div
        className="max-w-5xl max-h-[85vh] px-16 py-8 flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={image.src}
          alt={image.caption || ''}
          className="max-h-[75vh] max-w-full object-contain rounded-lg shadow-2xl"
        />
        {image.caption && (
          <p className="text-white/70 text-sm mt-4 text-center max-w-lg">{image.caption}</p>
        )}
        {images.length > 1 && (
          <p className="text-white/50 text-xs mt-2 uppercase tracking-wider">
            {currentIndex + 1} / {images.length}
          </p>
        )}
      </div>
    </div>
  );
}
