import { useEffect, useState } from 'react'
import { getGalleryItems } from '../lib/content.js'
import './Gallery.css'

export default function Gallery() {
  const items = getGalleryItems()
  const [activeIndex, setActiveIndex] = useState(null)

  useEffect(() => {
    if (activeIndex === null) return
    const onKey = (e) => {
      if (e.key === 'Escape') setActiveIndex(null)
      if (e.key === 'ArrowRight') setActiveIndex((i) => (i + 1) % items.length)
      if (e.key === 'ArrowLeft') setActiveIndex((i) => (i - 1 + items.length) % items.length)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [activeIndex, items.length])

  const active = activeIndex !== null ? items[activeIndex] : null

  return (
    <div className="page">
      <div className="panel">
        {items.length === 0 ? (
          <div className="empty-state">
            src/content/gallery/&lt;폴더명&gt;/ 에 meta.json, image.* 를 추가하면 여기 표시됩니다.
          </div>
        ) : (
          <div className="gallery-grid">
            {items.map((item, i) => (
              <button
                key={item.slug}
                type="button"
                className="gallery-cell"
                onClick={() => setActiveIndex(i)}
              >
                <img src={item.imageUrl} alt={item.title || ''} loading="lazy" />
              </button>
            ))}
          </div>
        )}
      </div>

      {active && (
        <div className="gallery-lightbox" onClick={() => setActiveIndex(null)}>
          <button
            className="gallery-lightbox-close"
            type="button"
            aria-label="닫기"
            onClick={() => setActiveIndex(null)}
          >
            ×
          </button>
          <img
            src={active.imageUrl}
            alt={active.title || ''}
            onClick={(e) => e.stopPropagation()}
          />
          <div className="gallery-lightbox-info" onClick={(e) => e.stopPropagation()}>
            {active.title && <div className="gallery-lightbox-title">{active.title}</div>}
            {active.caption && <div className="gallery-lightbox-caption">{active.caption}</div>}
            {active.date && <div className="gallery-lightbox-date">{active.date}</div>}
          </div>
        </div>
      )}
    </div>
  )
}
