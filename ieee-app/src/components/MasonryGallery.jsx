import { useState } from 'react';
import Lightbox from './Lightbox';

export default function MasonryGallery({ images }) {
  const [lightboxIndex, setLightboxIndex] = useState(null);

  if (!images || images.length === 0) {
    return (
      <div className="text-center py-12 bg-surface-container-low">
        <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-3">
          photo_library
        </span>
        <p className="text-on-surface-variant">No photos available for this event yet.</p>
      </div>
    );
  }

  const openLightbox = (index) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const navigateLightbox = (direction) => {
    setLightboxIndex((prev) => {
      const next = prev + direction;
      if (next < 0) return images.length - 1;
      if (next >= images.length) return 0;
      return next;
    });
  };

  return (
    <>
      <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
        {images.map((image, index) => (
          <button
            key={index}
            type="button"
            className="break-inside-avoid cursor-pointer group block overflow-hidden rounded-lg"
            onClick={() => openLightbox(index)}
          >
            <img
              src={image.src}
              alt={image.caption || `Event photo ${index + 1}`}
              className="w-full h-auto transition-transform duration-300 group-hover:scale-105"
            />
          </button>
        ))}
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          images={images}
          currentIndex={lightboxIndex}
          onClose={closeLightbox}
          onNavigate={navigateLightbox}
        />
      )}
    </>
  );
}
