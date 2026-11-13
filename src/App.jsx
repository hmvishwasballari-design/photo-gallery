import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp } from '@fortawesome/free-solid-svg-icons';
import {
  Camera, Moon, Sun, Search, LoaderCircle,
  RefreshCw, ArrowUpRight, Image as ImageIcon
} from 'lucide-react';

const API = 'https://picsum.photos/v2/list';

function PhotoCard({ photo, count, onLike, index }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <article className="photo-row">
      <div className="photo-image">
        {!imageLoaded && !imageFailed && <div className="image-skeleton" />}

        {imageFailed ? (
          <div className="image-fallback">
            <ImageIcon size={25} />
            <span>Image unavailable</span>
          </div>
        ) : (
          <img
            src={photo.download_url}
            alt={`Photograph by ${photo.author}`}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageFailed(true)}
            style={{ opacity: imageLoaded ? 1 : 0 }}
          />
        )}

        <span className="photo-number">
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>

      <div className="photo-information">
        <div className="photo-author-label">AUTHOR</div>
        <h3>Author: {photo.author}</h3>
        <span className="photo-id">PHOTO ID / {photo.id}</span>
      </div>

      <button
        className={`like-button ${count > 0 ? 'liked' : ''}`}
        onClick={() => onLike(photo.id)}
        aria-label={`Like photo by ${photo.author}. ${count} likes`}
      >
        <FontAwesomeIcon icon={faThumbsUp} />
        <span>{count}</span>
      </button>
    </article>
  );
}

export default function App() {
  const [photos, setPhotos] = useState([]);
  const [likes, setLikes] = useState({});
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState('');

  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('stillframe-theme') || 'dark';
    } catch {
      return 'dark';
    }
  });

  const sentinelRef = useRef(null);
  const loadingRef = useRef(false);

  useEffect(() => {
    try {
      localStorage.setItem('stillframe-theme', theme);
    } catch {
      // Theme remains available for this session.
    }
  }, [theme]);

  const loadPhotos = useCallback(async (targetPage) => {
    if (loadingRef.current || !hasMore) return;

    loadingRef.current = true;
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API}?page=${targetPage}`);

      if (!response.ok) {
        throw new Error(`Picsum returned HTTP ${response.status}.`);
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error('Unexpected response from Picsum.');
      }

      if (data.length === 0) {
        setHasMore(false);
        return;
      }

      setPhotos(previous => {
        const existingIds = new Set(previous.map(photo => photo.id));
        const newPhotos = data.filter(photo => !existingIds.has(photo.id));
        return [...previous, ...newPhotos];
      });

      setPage(targetPage);
    } catch (err) {
      console.error('Photo Gallery API error:', err);
      setError(
        `${err.message || 'Unable to fetch photos.'} Please check your connection and retry.`
      );
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [hasMore]);

  useEffect(() => {
    loadPhotos(1);
  }, [loadPhotos]);

  useEffect(() => {
    const sentinel = sentinelRef.current;

    if (!sentinel || !hasMore || loading || error) return;

    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !loadingRef.current) {
        loadPhotos(page + 1);
      }
    }, { rootMargin: '300px' });

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [page, hasMore, loading, error, loadPhotos]);

  const handleLike = id => {
    setLikes(previous => ({
      ...previous,
      [id]: (previous[id] || 0) + 1
    }));
  };

  const retry = () => {
    if (!loadingRef.current) {
      loadPhotos(page === 0 ? 1 : page + 1);
    }
  };

  const filteredPhotos = photos.filter(photo =>
    photo.author.toLowerCase().includes(search.toLowerCase())
  );

  const totalLikes = Object.values(likes).reduce(
    (sum, value) => sum + value, 0
  );

  return (
    <div className="gallery-app" data-theme={theme}>
      <header className="topbar">
        <a className="brand" href="#top">
          <span className="brand-icon"><Camera size={17} /></span>
          STILLFRAME<span className="brand-dot">.</span>
        </a>

        <div className="topbar-right">
          <span className="collection-status"><i /> PHOTO COLLECTION</span>
          <span className="topbar-divider" />
          <button
            className="theme-toggle"
            onClick={() => setTheme(current =>
              current === 'dark' ? 'light' : 'dark'
            )}
            aria-label="Toggle colour theme"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            <span>{theme === 'dark' ? 'LIGHT MODE' : 'DARK MODE'}</span>
          </button>
        </div>
      </header>

      <main className="page-container" id="top">
        <section className="page-heading">
          <div className="eyebrow"><span /> THE VISUAL JOURNAL</div>
          <h1>Photo <em>Gallery.</em></h1>
          <p>
            A collection of photographs and the people behind them.
            Explore, discover and appreciate every frame.
          </p>
          <div className="heading-meta">
            <span>01 — PHOTOGRAPHY</span>
            <span>•</span>
            <span>INFINITE COLLECTION</span>
          </div>
        </section>

        <section className="collection-section">
          <div className="collection-heading">
            <div>
              <div className="eyebrow"><span /> THE COLLECTION</div>
              <h2>Captured <em>moments.</em></h2>
            </div>

            <div className="stats">
              <div>
                <strong>{String(photos.length).padStart(2, '0')}</strong>
                <span>PHOTOS</span>
              </div>
              <div>
                <strong>{String(totalLikes).padStart(2, '0')}</strong>
                <span>LIKES</span>
              </div>
            </div>
          </div>

          <div className="toolbar">
            <span className="result-count">
              SHOWING {filteredPhotos.length} OF {photos.length} PHOTOS
            </span>

            <label className="search-box">
              <Search size={15} />
              <input
                type="search"
                placeholder="Search photographer..."
                value={search}
                onChange={event => setSearch(event.target.value)}
                aria-label="Search photographers"
              />
            </label>
          </div>

          <div className="photo-list">
            {filteredPhotos.map((photo, index) => (
              <PhotoCard
                key={photo.id}
                photo={photo}
                index={index}
                count={likes[photo.id] || 0}
                onLike={handleLike}
              />
            ))}

            {!loading && photos.length > 0 && filteredPhotos.length === 0 && (
              <div className="empty-state">
                <Search size={25} />
                <strong>No photographers found.</strong>
                <span>Try another search term.</span>
                <button onClick={() => setSearch('')}>
                  Clear search <ArrowUpRight size={14} />
                </button>
              </div>
            )}

            {loading && (
              <div className="loading-state">
                <LoaderCircle className="spin" size={19} />
                <span>LOADING PHOTOGRAPHS</span>
              </div>
            )}

            {error && (
              <div className="error-state">
                <div className="error-icon"><RefreshCw size={20} /></div>
                <strong>Unable to load photographs</strong>
                <span>{error}</span>
                <button onClick={retry} disabled={loading}>
                  <RefreshCw size={14} /> Retry loading
                </button>
              </div>
            )}

            {!hasMore && photos.length > 0 && (
              <div className="end-state">
                <span>—</span>
                YOU'VE REACHED THE END OF THE COLLECTION
                <span>—</span>
              </div>
            )}

            <div className="scroll-sentinel" ref={sentinelRef} />
          </div>
        </section>

        <footer className="footer">
          <a className="brand" href="#top">
            <span className="brand-icon"><Camera size={15} /></span>
            STILLFRAME<span className="brand-dot">.</span>
          </a>
          <span>MADE FOR THE MOMENTS BETWEEN.</span>
          <a href="#top">BACK TO TOP ↑</a>
        </footer>
      </main>
    </div>
  );
}
