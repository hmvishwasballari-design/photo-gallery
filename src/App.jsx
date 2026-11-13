import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp } from '@fortawesome/free-solid-svg-icons';
import {
  Camera, Moon, Sun, Search, ArrowUpRight, MapPin
} from 'lucide-react';

const PHOTOS = [
  {
    id: 'local-1',
    author: 'Premnath T. Murkoth',
    location: 'Palakkad Gap, Western Ghats, India',
    title: 'Western Ghats',
    file: 'photo-1.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:Western_Ghats..jpg',
    license: 'CC BY-SA 3.0'
  },
  {
    id: 'local-2',
    author: 'Arivumathi',
    location: 'Gomukhi Dam, Kachirayapalayam, Tamil Nadu',
    title: 'Western Ghats',
    file: 'photo-2.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:%22Western_ghats%22.JPG',
    license: 'CC BY-SA 3.0'
  },
  {
    id: 'local-3',
    author: 'Pranav Kumar',
    location: 'Uttarakhand, India',
    title: 'Mountain Forest',
    file: 'photo-3.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:Mountain_forest_in_India_-_Far_from_home.jpg',
    license: 'CC BY-SA 4.0'
  },
  {
    id: 'local-4',
    author: 'Man On Mission',
    location: 'Western Ghats, Karnataka, India',
    title: 'Western Ghats Scenery',
    file: 'photo-4.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:Scenery_western_ghats.JPG',
    license: 'GFDL / CC BY-SA'
  },
  {
    id: 'local-5',
    author: 'Shravan Kamath94',
    location: 'Charmadi Ghats, Karnataka, India',
    title: 'Western Ghats Landscape',
    file: 'photo-5.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:Western_Ghats,_India.jpg',
    license: 'CC BY-SA 4.0'
  },
  {
    id: 'local-6',
    author: 'Samson Joseph',
    location: 'Western Ghats region, Karnataka, India',
    title: 'Western Ghats in Karnataka',
    file: 'photo-6.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:Western_Ghats_in_Karnataka.jpg',
    license: 'CC BY-SA 4.0'
  },
  {
    id: 'local-7',
    author: 'Navya1329',
    location: 'India',
    title: 'Forest and Mountain River',
    file: 'photo-7.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:A_forest_alongside_mountain_and_river_(India,_2016).jpg',
    license: 'CC BY-SA 4.0'
  },
  {
    id: 'local-8',
    author: 'TulikaPriyadarshini',
    location: 'Manali, Himachal Pradesh, India',
    title: 'Mountain Forest',
    file: 'photo-8.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:Mountain_Forest.jpg',
    license: 'CC BY-SA 4.0'
  },
  {
    id: 'local-9',
    author: 'Snehashish Chatterjee',
    location: 'Mountains of India',
    title: 'Forest Mountain',
    file: 'photo-9.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:Forest_Mountain.jpg',
    license: 'CC BY-SA 4.0'
  },
  {
    id: 'local-10',
    author: 'Giri.kalpesh20',
    location: 'Sonprayag, Uttarakhand, India',
    title: 'Green Forest Mountain',
    file: 'photo-10.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:Green_forest_mountain.jpg',
    license: 'CC BY-SA 4.0'
  },
  {
    id: 'local-11',
    author: 'Abhiraj1720',
    location: 'Mountains of India',
    title: 'Forest Covered Mountain',
    file: 'photo-11.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:Forest_covered_mountain.jpg',
    license: 'CC BY-SA 4.0'
  },
  {
    id: 'local-12',
    author: 'Shahid Nawaz Landge',
    location: 'Kudremukh National Park, Karnataka, India',
    title: 'Cloud Forest',
    file: 'photo-12.jpg',
    source: 'https://commons.wikimedia.org/wiki/File:Kudremukha_National_Park.jpg',
    license: 'CC BY-SA 4.0'
  }
];

function PhotoCard({ photo, index, count, onLike }) {
  return (
    <article className="photo-row reveal">
      <div className="photo-image">
        <img
          src={`/photos/${photo.file}`}
          alt={`${photo.title} photographed by ${photo.author}`}
          loading="eager"
          decoding="async"
        />
        <span className="photo-number">
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>

      <div className="photo-information">
        <div className="photo-author-label">PHOTOGRAPHER</div>
        <h3>{photo.author}</h3>

        <div className="photo-location">
          <MapPin size={15} />
          <span>{photo.location}</span>
        </div>

        <div className="photo-id">
          {photo.title.toUpperCase()} / PHOTO {String(index + 1).padStart(2, '0')}
        </div>

        <a
          className="photo-credit"
          href={photo.source}
          target="_blank"
          rel="noreferrer"
        >
          IMAGE SOURCE & LICENCE ({photo.license})
          <ArrowUpRight size={13} />
        </a>
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
  const [likes, setLikes] = useState({});
  const [search, setSearch] = useState('');

  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('stillframe-theme') || 'dark';
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('stillframe-theme', theme);
    } catch {
      // Theme remains active for this session.
    }
  }, [theme]);

  const handleLike = id => {
    setLikes(previous => ({
      ...previous,
      [id]: (previous[id] || 0) + 1
    }));
  };

  const filteredPhotos = PHOTOS.filter(photo =>
    photo.author.toLowerCase().includes(search.toLowerCase()) ||
    photo.location.toLowerCase().includes(search.toLowerCase()) ||
    photo.title.toLowerCase().includes(search.toLowerCase())
  );

  // Reveal photographs smoothly as they enter the viewport.
  useEffect(() => {
    const cards = document.querySelectorAll('.photo-row');

    if (!('IntersectionObserver' in window)) {
      cards.forEach(card => card.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -35px 0px'
    });

    cards.forEach(card => observer.observe(card));

    return () => observer.disconnect();
  }, [search, filteredPhotos.length]);

  // Keep the cursor spotlight subtle and lightweight.
  useEffect(() => {
    const handlePointerMove = event => {
      document.body.style.setProperty('--mx', `${event.clientX}px`);
      document.body.style.setProperty('--my', `${event.clientY}px`);
    };

    window.addEventListener('pointermove', handlePointerMove, {
      passive: true
    });

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
    };
  }, []);

  const totalLikes = Object.values(likes).reduce(
    (sum, value) => sum + value, 0
  );

  return (
    <div className="gallery-app" data-theme={theme}>
      <div className="ambient-background" aria-hidden="true">
        <span className="ambient-orb orb-one" />
        <span className="ambient-orb orb-two" />
        <span className="ambient-orb orb-three" />
        <span className="ambient-grain" />
      </div>

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
            <span>12 CURATED PHOTOGRAPHS</span>
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
                <strong>{String(PHOTOS.length).padStart(2, '0')}</strong>
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
              SHOWING {filteredPhotos.length} OF {PHOTOS.length} PHOTOS
            </span>

            <label className="search-box">
              <Search size={15} />
              <input
                type="search"
                placeholder="Search photographer or location..."
                value={search}
                onChange={event => setSearch(event.target.value)}
                aria-label="Search photographers or locations"
              />
            </label>
          </div>

          <div className="photo-list">
            {filteredPhotos.map((photo, index) => (
              <PhotoCard
                key={photo.id}
                photo={photo}
                index={PHOTOS.indexOf(photo)}
                count={likes[photo.id] || 0}
                onLike={handleLike}
              />
            ))}

            {filteredPhotos.length === 0 && (
              <div className="empty-state">
                <Search size={25} />
                <strong>No photographs found.</strong>
                <span>Try another photographer, title or location.</span>
                <button onClick={() => setSearch('')}>
                  Clear search <ArrowUpRight size={14} />
                </button>
              </div>
            )}
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
