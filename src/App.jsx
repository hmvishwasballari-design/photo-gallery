import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp } from '@fortawesome/free-solid-svg-icons';
import {
  ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight,
  Camera, ChevronLeft, ChevronRight, MapPin,
  Search, X
} from 'lucide-react';
import PHOTOS from './photos-data';

const pad = value => String(value).padStart(2, '0');

function PhotoDeck({ photos, onOpen }) {
  const [order, setOrder] = useState(photos.map((_, i) => i));
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const pointer = useRef(null);
  const suppressClick = useRef(false);

  useEffect(() => {
    setOrder(photos.map((_, i) => i));
  }, [photos]);

  const throwCard = direction => {
    if (order.length < 2) return;
    setDrag({ x: direction * 620, y: 35 });
    window.setTimeout(() => {
      setOrder(current => [...current.slice(1), current[0]]);
      setDrag({ x: 0, y: 0 });
    }, 220);
  };

  const onPointerDown = event => {
    if (event.button !== 0) return;
    pointer.current = { x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = event => {
    if (!pointer.current) return;
    setDrag({
      x: event.clientX - pointer.current.x,
      y: event.clientY - pointer.current.y
    });
  };

  const onPointerUp = () => {
    if (!pointer.current) return;
    const distance = drag.x;
    pointer.current = null;
    if (Math.abs(distance) > 85) {
      suppressClick.current = true;
      window.setTimeout(() => {
        suppressClick.current = false;
      }, 350);
      throwCard(distance > 0 ? 1 : -1);
    } else {
      setDrag({ x: 0, y: 0 });
    }
  };

  const topPhoto = photos[order[0]];

  if (!topPhoto) return <p className="deck-empty">No photographs match this search.</p>;

  return (
    <div className="deck-layout">
      <div className="deck-stage">
        {order.slice(0, 3).map((photoIndex, stackIndex) => {
          const photo = photos[photoIndex];
          if (!photo) return null;

          return (
            <article
              key={photo.id}
              className={`deck-card deck-card-${stackIndex}`}
              style={stackIndex === 0 ? {
                transform: `translate(${drag.x}px, ${drag.y}px) rotate(${drag.x * 0.035}deg)`,
                zIndex: 3
              } : { zIndex: 3 - stackIndex }}
              onClick={stackIndex === 0 ? () => {
                if (!suppressClick.current) onOpen(photo);
              } : undefined}
              onPointerDown={stackIndex === 0 ? onPointerDown : undefined}
              onPointerMove={stackIndex === 0 ? onPointerMove : undefined}
              onPointerUp={stackIndex === 0 ? onPointerUp : undefined}
              onPointerCancel={stackIndex === 0 ? onPointerUp : undefined}
            >
              <img src={`/photos/${photo.file}`} alt={photo.title} draggable="false" />
              <div className="deck-card-caption">
                <span>{photo.location}</span>
                <strong>{photo.title}</strong>
              </div>
              {stackIndex === 0 && (
                <button
                  className="deck-open"
                  type="button"
                  onClick={event => {
                    event.stopPropagation();
                    onOpen(photo);
                  }}
                  aria-label={`Open ${photo.title}`}
                >
                  <ArrowUpRight size={20} />
                </button>
              )}
            </article>
          );
        })}
      </div>

      <div className="deck-copy">
        <span className="section-index">01 — SELECTED FRAMES</span>
        <h3>One frame.<br /><em>Many stories.</em></h3>
        <p>Move through the collection at your own pace. Each photograph holds a different perspective of India's landscapes.</p>
        <div className="deck-controls">
          <button type="button" onClick={() => throwCard(-1)} aria-label="Previous card"><ArrowLeft /></button>
          <button type="button" onClick={() => throwCard(1)} aria-label="Next card"><ArrowRight /></button>
          <span>DRAG TO EXPLORE</span>
        </div>
        <span className="deck-count">{pad(order[0] + 1)} <i>/</i> {pad(photos.length)}</span>
      </div>
    </div>
  );
}

function PhotoViewer({ photo, photos, onClose, onNavigate }) {
  const index = photos.findIndex(item => item.id === photo.id);

  useEffect(() => {
    const handleKey = event => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowRight') onNavigate(1);
      if (event.key === 'ArrowLeft') onNavigate(-1);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKey);
    };
  }, [onClose, onNavigate]);

  return (
    <div className="viewer-overlay" role="dialog" aria-modal="true" aria-label="Photograph viewer" onClick={onClose}>
      <button className="viewer-close" onClick={onClose} aria-label="Close viewer"><X /></button>
      <button className="viewer-nav viewer-previous" onClick={event => { event.stopPropagation(); onNavigate(-1); }} aria-label="Previous photo"><ChevronLeft /></button>
      <div className="viewer-content" onClick={event => event.stopPropagation()}>
        <div className="viewer-image-wrap">
          <img src={`/photos/${photo.file}`} alt={photo.title} />
        </div>
        <aside className="viewer-details">
          <span className="viewer-kicker">STILLFRAME / THE COLLECTION</span>
          <span className="viewer-index">FRAME {pad(index + 1)} / {pad(photos.length)}</span>
          <h2>{photo.title}</h2>
          <div className="viewer-rule" />
          <div className="viewer-detail-item"><span>PHOTOGRAPHER</span><strong>{photo.author}</strong></div>
          <div className="viewer-detail-item"><span>LOCATION</span><strong>{photo.location}</strong></div>
          <div className="viewer-detail-item"><span>IMAGE LICENCE</span><strong>{photo.license}</strong></div>
          <a className="viewer-credit-link" href={photo.source} target="_blank" rel="noreferrer">VIEW ORIGINAL SOURCE <ArrowUpRight size={15} /></a>
          <div className="viewer-bottom"><span>USE ← → TO EXPLORE</span><span>ESC TO CLOSE</span></div>
        </aside>
      </div>
      <button className="viewer-nav viewer-next" onClick={event => { event.stopPropagation(); onNavigate(1); }} aria-label="Next photo"><ChevronRight /></button>
    </div>
  );
}

export default function App() {
  const [likes, setLikes] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('stillframe-likes') || '{}');
      return saved && typeof saved === 'object' && !Array.isArray(saved) ? saved : {};
    } catch {
      return {};
    }
  });
  const [search, setSearch] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [topbarHidden, setTopbarHidden] = useState(false);
  const heroRef = useRef(null);

  const filteredPhotos = useMemo(() => {
    const query = search.trim().toLowerCase();
    return PHOTOS.filter(photo =>
      [photo.author, photo.location, photo.title].some(value =>
        value.toLowerCase().includes(query)
      )
    );
  }, [search]);

  useEffect(() => {
    try {
      localStorage.setItem('stillframe-likes', JSON.stringify(likes));
    } catch (error) {
      console.warn('Could not save photo appreciations:', error);
    }
  }, [likes]);

  useEffect(() => {
    if (!selectedPhoto) return;

    if (filteredPhotos.length === 0) {
      setSelectedPhoto(null);
      return;
    }

    const stillVisible = filteredPhotos.some(photo => photo.id === selectedPhoto.id);
    if (!stillVisible) {
      setSelectedPhoto(filteredPhotos[0]);
    }
  }, [selectedPhoto, filteredPhotos]);

  const totalLikes = Object.values(likes).reduce((sum, value) => sum + value, 0);

  const handleLike = id => {
    setLikes(previous => ({ ...previous, [id]: (previous[id] || 0) + 1 }));
  };

  const closeViewer = useCallback(() => {
    setSelectedPhoto(null);
  }, []);

  const navigateViewer = useCallback(direction => {
    if (!selectedPhoto || filteredPhotos.length === 0) return;

    const foundIndex = filteredPhotos.findIndex(photo => photo.id === selectedPhoto.id);
    const index = foundIndex >= 0 ? foundIndex : 0;

    const nextIndex = (index + direction + filteredPhotos.length) % filteredPhotos.length;
    setSelectedPhoto(filteredPhotos[nextIndex]);
  }, [selectedPhoto, filteredPhotos]);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY <= 80) {
        setTopbarHidden(false);
      } else if (Math.abs(currentScrollY - lastScrollY) > 5) {
        setTopbarHidden(currentScrollY > lastScrollY);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const stage = heroRef.current;
    if (!stage) return;

    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = stage.getBoundingClientRect();
        const distance = Math.max(1, stage.offsetHeight - window.innerHeight);
        const progress = Math.min(1, Math.max(0, -rect.top / distance));
        stage.style.setProperty('--portal-progress', progress);
      });
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
    return () => observer.disconnect();
  }, [search]);

  return (
    <div className="gallery-app" data-theme="dark">
      <header className={`topbar${topbarHidden ? " topbar-hidden" : ""}`}>
        <a className="brand" href="#top"><Camera size={17} /> STILLFRAME<span className="brand-dot">.</span></a>
      </header>

      <main id="top">
        <section className="portal" ref={heroRef} aria-label="Stillframe introduction">
          <div className="portal-sticky">
            <div className="portal-image" />
            <div className="portal-shade" />
            <div className="portal-panel portal-panel-left" />
            <div className="portal-panel portal-panel-right" />
            <div className="portal-topline"><span>AN INDEPENDENT VISUAL JOURNAL</span><span>INDIA / EST. 2026</span></div>
            <div className="portal-wordmark">
  <div className="portal-marquee">
    <span>PHOTO GALLERY</span>
    <span aria-hidden="true">PHOTO GALLERY</span>
  </div>
</div>
            <div className="portal-subline"><span>LANDSCAPES / PEOPLE / PERSPECTIVES</span><span>SCROLL TO DISCOVER ↓</span></div>
            <div className="portal-marker portal-marker-left">●</div>
            <div className="portal-marker portal-marker-right">●</div>
          </div>
        </section>

        <section className="statement-section reveal" id="statement">
          <div className="statement-top"><span className="section-index">01 / THE JOURNAL</span><span>AN EXERCISE IN OBSERVATION</span></div>
          <div className="statement-content">
            <h2>Not just places.<br />A way of <em>seeing.</em></h2>
            <span className="statement-number">12</span>
            <div className="statement-image">
              <img src="/photos/photo-3.jpg" alt="Mountain forest landscape" loading="lazy" />
            </div>
          </div>
          <div className="statement-bottom">
            <p>A considered collection of landscapes, light and quiet moments. Every frame has a place, a photographer and a story worth keeping.</p>
            <a href="#selected">ENTER THE COLLECTION <ArrowDown size={15} /></a>
          </div>
        </section>

        <section className="selected-section" id="selected">
          <div className="section-heading reveal">
            <div><span className="section-index">02 / THE SELECTION</span><h2>Frames in <em>focus.</em></h2></div>
            <span className="section-side-note">A SMALL STUDY OF THE LANDSCAPE<br />12 PHOTOGRAPHS / INDIA</span>
          </div>
          <PhotoDeck photos={filteredPhotos} onOpen={setSelectedPhoto} />
        </section>

        <section className="index-section" id="index">
          <div className="section-heading reveal">
            <div><span className="section-index">03 / THE ARCHIVE</span><h2>The photo <em>index.</em></h2></div>
            <div className="index-total"><strong>{pad(filteredPhotos.length)}</strong><span>OF {pad(PHOTOS.length)} FRAMES</span></div>
          </div>
          <div className="index-toolbar">
            <span>CATALOGUE / 2026</span>
            <label className="search-box">
              <Search size={15} />
              <input type="search" placeholder="Search title, photographer or place..." value={search} onChange={event => setSearch(event.target.value)} aria-label="Search photo index" />
              {search && <button type="button" onClick={() => setSearch('')} aria-label="Clear search"><X size={14} /></button>}
            </label>
          </div>
          <div className="photo-index">
            <div className="index-table-head"><span>NO.</span><span>PHOTOGRAPH / PLACE</span><span>PHOTOGRAPHER</span><span>LICENCE</span><span>LIKE</span></div>
            {filteredPhotos.map(photo => {
              const number = PHOTOS.indexOf(photo);
              return (
                <div className="index-row reveal" key={photo.id}>
                  <span className="index-number">{pad(number + 1)}</span>
                  <button className="index-photo-title" type="button" onClick={() => setSelectedPhoto(photo)}>
                    <strong>{photo.title}</strong><span><MapPin size={12} /> {photo.location}</span>
                  </button>
                  <span className="index-author">{photo.author}</span>
                  <a className="index-license" href={photo.source} target="_blank" rel="noreferrer">{photo.license} <ArrowUpRight size={12} /></a>
                  <button className={`like-button ${likes[photo.id] ? 'liked' : ''}`} onClick={() => handleLike(photo.id)} aria-label={`Like ${photo.title}`}>
                    <FontAwesomeIcon icon={faThumbsUp} /><span>{likes[photo.id] || 0}</span>
                  </button>
                </div>
              );
            })}
            {filteredPhotos.length === 0 && <div className="empty-state">NO MATCHING PHOTOGRAPHS. TRY ANOTHER SEARCH.</div>}
          </div>
          <div className="index-foot"><span>SHOWING {filteredPhotos.length} OF {PHOTOS.length} PHOTOGRAPHS</span><span>TOTAL APPRECIATIONS / {pad(totalLikes)}</span></div>
        </section>

        <section className="closing-section">
          <span className="section-index">04 / END OF TRANSMISSION</span>
          <div className="closing-marquee">
            <div className="closing-marquee-track">
              <span>PHOTO GALLERY</span>
              <span aria-hidden="true">PHOTO GALLERY</span>
            </div>
          </div>
          <div className="closing-bottom"><span>KEEP LOOKING CLOSER.</span><a href="#top">BACK TO THE BEGINNING ↑</a></div>
        </section>

        <footer className="footer">
          <a className="brand" href="#top"><Camera size={15} /> STILLFRAME<span className="brand-dot">.</span></a>
          <span>AN INDEPENDENT VISUAL JOURNAL</span>
          <span>© 2026 / ALL PHOTOGRAPHS CREDITED TO THEIR AUTHORS</span>
        </footer>
      </main>

      {selectedPhoto && (
        <PhotoViewer
          photo={selectedPhoto}
          photos={filteredPhotos}
          onClose={closeViewer}
          onNavigate={navigateViewer}
        />
      )}
    </div>
  );
}
