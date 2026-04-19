const API_KEY = '8265bd1679663a7ea12ac168da84d2e8';
const BASE = 'https://api.themoviedb.org/3';
const IMG = 'https://image.tmdb.org/t/p/';

let currentItem = null;
let currentType = 'movie';
let currentSeason = 1;
let currentEp = 1;
let heroItem = null;
let currentServer = 0;
let searchTimeout = null;

// 🔥 IDIOMA PRINCIPAL: ESPAÑOL
const AUDIO_LANGUAGE = { code: 'es', name: '🇪🇸 Español' };

// 🚀 SOLO EL SERVIDOR QUE FUNCIONA (2Embed con Español)
const SERVERS = [
  { 
    name: '🎬 Server 1 (2Embed - Español)',
    getUrl: (type, id, s, e) => {
      if (type === 'tv') {
        return `https://www.2embed.cc/embedtv/${id}&s=${s}&e=${e}&lang=es`;
      } else {
        return `https://www.2embed.cc/embed/${id}?lang=es`;
      }
    }
  }
];

// 📋 GÉNEROS
const GENRES_MOVIE = [
  {id:28,name:'Acción'},{id:35,name:'Comedia'},{id:18,name:'Drama'},
  {id:27,name:'Terror'},{id:878,name:'Ciencia Ficción'},{id:10749,name:'Romance'},
  {id:16,name:'Animación'},{id:12,name:'Aventura'},{id:80,name:'Crimen'},
  {id:14,name:'Fantasía'},{id:53,name:'Thriller'},{id:36,name:'Historia'},
];
const GENRES_TV = [
  {id:10759,name:'Acción'},{id:35,name:'Comedia'},{id:18,name:'Drama'},
  {id:9648,name:'Misterio'},{id:10765,name:'Sci-Fi y Fantasía'},
  {id:10768,name:'Guerra'},{id:10762,name:'Infantil'},{id:10767,name:'Talk Show'},
];

// 🔧 FUNCIONES BASE API
async function tmdb(path, params = {}) {
  try {
    const url = new URL(BASE + path);
    url.searchParams.set('api_key', API_KEY);
    url.searchParams.set('language', 'es-ES');
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error TMDB:', error);
    return { results: [] };
  }
}

function posterUrl(path, size = 'w300') {
  return path ? IMG + size + path : 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 450"><rect fill="%2314141e" width="300" height="450"/><text x="150" y="230" text-anchor="middle" fill="%238888aa" font-size="40">🎬</text></svg>';
}

function backdropUrl(path) {
  return path ? IMG + 'w1280' + path : '';
}

function buildCards(items, type) {
  if (!items || items.length === 0) return '<p style="color:var(--muted);padding:1rem;">No se encontraron resultados.</p>';
  return items.map(item => {
    const title = item.title || item.name || 'Sin título';
    const year = (item.release_date || item.first_air_date || '').slice(0,4);
    const rating = item.vote_average ? item.vote_average.toFixed(1) : '—';
    const t = item.media_type || type;
    return `<div class="movie-card" onclick="openItem(${item.id},'${t}')">
      <div class="movie-type-badge">${t === 'tv' ? 'SERIE' : 'PELÍCULA'}</div>
      <img class="movie-poster" src="${posterUrl(item.poster_path)}" alt="${title}" loading="lazy">
      <div class="movie-info">
        <div class="movie-name" title="${title}">${title}</div>
        <div class="movie-year"><span>${year || '—'}</span><span class="movie-rating">★ ${rating}</span></div>
      </div>
    </div>`;
  }).join('');
}

function renderGrid(id, items, type) {
  const container = document.getElementById(id);
  if (container) container.innerHTML = buildCards(items, type);
}

// 📺 CARGA DE CONTENIDO PRINCIPAL
async function loadTrending() {
  const type = currentType === 'movie' ? 'movie' : 'tv';
  
  const trendingGrid = document.getElementById('trending-grid');
  const topratedGrid = document.getElementById('toprated-grid');
  const upcomingGrid = document.getElementById('upcoming-grid');
  
  if (trendingGrid) trendingGrid.innerHTML = '<div class="loading-spinner"><div class="spinner"></div> Cargando...</div>';
  if (topratedGrid) topratedGrid.innerHTML = '<div class="loading-spinner"><div class="spinner"></div> Cargando...</div>';
  if (upcomingGrid) upcomingGrid.innerHTML = '<div class="loading-spinner"><div class="spinner"></div> Cargando...</div>';
  
  const trending = await tmdb(`/trending/${type}/week`);
  renderGrid('trending-grid', trending.results?.slice(0, 20) || [], type);
  if (trending.results?.length > 0) setHero(trending.results[Math.floor(Math.random() * Math.min(5, trending.results.length))], type);
  
  const topRated = await tmdb(`/${type}/top_rated`);
  renderGrid('toprated-grid', topRated.results?.slice(0, 20) || [], type);
  
  if (type === 'movie') {
    const upcoming = await tmdb('/movie/upcoming');
    renderGrid('upcoming-grid', upcoming.results?.slice(0, 20) || [], type);
    const sectionTitle = document.querySelector('.section:last-of-type .section-title');
    if (sectionTitle) sectionTitle.innerHTML = '<span>🆕</span> PRÓXIMOS ESTRENOS';
  } else {
    const airing = await tmdb('/tv/on_the_air');
    renderGrid('upcoming-grid', airing.results?.slice(0, 20) || [], type);
    const sectionTitle = document.querySelector('.section:last-of-type .section-title');
    if (sectionTitle) sectionTitle.innerHTML = '<span>📺</span> SERIES EN EMISIÓN';
  }
}

function setMode(type) {
  currentType = type;
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  if (window.event && window.event.target) window.event.target.classList.add('active');
  buildGenreTabs();
  loadTrending();
}

function buildGenreTabs() {
  const genres = currentType === 'movie' ? GENRES_MOVIE : GENRES_TV;
  const tabs = document.getElementById('genre-tabs');
  if (tabs) {
    tabs.innerHTML = genres.map(g => `<button class="filter-tab" onclick="loadGenre(${g.id}, this)">${g.name}</button>`).join('');
  }
}

async function loadGenre(genreId, el) {
  document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  const type = currentType === 'movie' ? 'movie' : 'tv';
  const trendingGrid = document.getElementById('trending-grid');
  if (trendingGrid) trendingGrid.innerHTML = '<div class="loading-spinner"><div class="spinner"></div> Cargando...</div>';
  const data = await tmdb(`/discover/${type}`, { with_genres: genreId, sort_by: 'popularity.desc' });
  renderGrid('trending-grid', data.results?.slice(0, 20) || [], type);
  const gridElement = document.getElementById('trending-grid');
  if (gridElement) gridElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// 🎬 HERO
function setHero(item, type) {
  if (!item) return;
  heroItem = { ...item, media_type: type };
  const title = item.title || item.name || '';
  const year = (item.release_date || item.first_air_date || '').slice(0,4);
  const heroBg = document.getElementById('hero-bg');
  const heroTitle = document.getElementById('hero-title');
  const heroRating = document.getElementById('hero-rating');
  const heroYear = document.getElementById('hero-year');
  const heroDesc = document.getElementById('hero-desc');
  const heroBadge = document.getElementById('hero-badge');
  
  if (heroBg) heroBg.style.backgroundImage = `url(${backdropUrl(item.backdrop_path)})`;
  if (heroTitle) heroTitle.textContent = title;
  if (heroRating) heroRating.textContent = `★ ${item.vote_average ? item.vote_average.toFixed(1) : '—'}`;
  if (heroYear) heroYear.textContent = year;
  if (heroDesc) heroDesc.textContent = item.overview || 'Sin descripción disponible.';
  if (heroBadge) heroBadge.textContent = type === 'tv' ? 'SERIE EN TENDENCIA' : 'PELÍCULA EN TENDENCIA';
}

function playHero() { if (heroItem) openItem(heroItem.id, heroItem.media_type, true); }
function infoHero() { if (heroItem) openItem(heroItem.id, heroItem.media_type, false); }

// 🍿 MODAL Y REPRODUCTOR
async function openItem(id, type, autoPlay = false) {
  currentItem = { id, type };
  currentSeason = 1; 
  currentEp = 1; 
  currentServer = 0;
  
  const modalOverlay = document.getElementById('modal-overlay');
  if (modalOverlay) {
    modalOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  const info = await tmdb(`/${type}/${id}`, { append_to_response: 'genres,seasons' });
  const title = info.title || info.name || '—';
  const year = (info.release_date || info.first_air_date || '').slice(0,4);
  const rating = info.vote_average ? info.vote_average.toFixed(1) : '—';
  const runtime = info.runtime ? `${info.runtime} min` : (info.episode_run_time?.[0] ? `${info.episode_run_time[0]} min/ep` : '');
  const genres = (info.genres || []).map(g => g.name).slice(0,3).join(', ');

  const modalTitle = document.getElementById('modal-title');
  const modalDesc = document.getElementById('modal-desc');
  const modalMeta = document.getElementById('modal-meta');
  
  if (modalTitle) modalTitle.textContent = title;
  if (modalDesc) modalDesc.textContent = info.overview || 'Sin descripción.';
  if (modalMeta) {
    modalMeta.innerHTML = `
      <span class="tag accent">★ ${rating}</span>
      <span class="tag">${year}</span>
      ${runtime ? `<span class="tag">${runtime}</span>` : ''}
      ${genres ? `<span class="tag">${genres}</span>` : ''}
      <span class="tag">${type === 'tv' ? '📺 Serie' : '🎬 Película'}</span>
    `;
  }

  const placeholder = document.getElementById('player-placeholder');
  if (placeholder) {
    placeholder.style.backgroundImage = info.backdrop_path ? `url(${backdropUrl(info.backdrop_path)})` : '';
    placeholder.style.display = 'flex';
  }
  
  const existingIframe = document.querySelector('#modal-player iframe');
  if (existingIframe) existingIframe.remove();

  // 🎛️ SELECTOR DE SERVIDOR (SOLO UNO)
  const serverTabs = document.getElementById('server-tabs');
  if (serverTabs) {
    serverTabs.innerHTML = `
      <div style="width:100%; margin-bottom: 15px; text-align:center;">
        <span style="background:#00e5ff; color:#000; padding:8px 16px; border-radius:30px; font-size:14px; font-weight:bold;">
          🎬 AUDIO Y SUBTÍTULOS EN ESPAÑOL
        </span>
      </div>
      <div style="display:flex; gap:10px; flex-wrap:wrap; justify-content:center;">
        ${SERVERS.map((s, i) => `<button class="server-tab active" style="background:#00e5ff; color:#000;">${s.name}</button>`).join('')}
      </div>
    `;
  }

  // 📺 CONTROLES DE SERIE
  const tvCtrl = document.getElementById('tv-controls');
  if (type === 'tv') {
    if (tvCtrl) tvCtrl.style.display = 'block';
    const seasons = (info.seasons || []).filter(s => s.season_number > 0);
    const seasonSel = document.getElementById('season-select');
    if (seasonSel) {
      seasonSel.innerHTML = seasons.map(s => `<option value="${s.season_number}">Temporada ${s.season_number} (${s.episode_count} episodios)</option>`).join('');
    }
    loadEpisodesCount(seasons[0]?.episode_count || 10);
  } else {
    if (tvCtrl) tvCtrl.style.display = 'none';
  }

  if (autoPlay) startPlay();
}

function loadEpisodesCount(count) {
  const grid = document.getElementById('episodes-grid');
  if (grid) {
    const maxEps = Math.min(count, 50);
    grid.innerHTML = Array.from({length: maxEps}, (_, i) => i+1).map(n =>
      `<button class="ep-btn ${n===1?'active':''}" onclick="selectEp(${n}, this)">${n}</button>`
    ).join('');
  }
  currentEp = 1;
}

async function loadEpisodes() {
  const sel = document.getElementById('season-select');
  if (sel) currentSeason = parseInt(sel.value);
  const data = await tmdb(`/tv/${currentItem.id}/season/${currentSeason}`);
  loadEpisodesCount(data.episodes?.length || 10);
  if (document.querySelector('#modal-player iframe')) startPlay();
}

function selectEp(ep, el) {
  currentEp = ep;
  document.querySelectorAll('.ep-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  startPlay();
}

function changeServer(idx, el) {
  // Solo hay un servidor, no hace nada
  console.log('Solo hay un servidor disponible');
}

function startPlay() {
  if (!currentItem) return;
  const { id, type } = currentItem;
  const url = SERVERS[0].getUrl(type, id, currentSeason, currentEp);
  
  console.log('🎬 Cargando URL:', url);
  
  const placeholder = document.getElementById('player-placeholder');
  if (placeholder) placeholder.style.display = 'none';
  
  const existing = document.querySelector('#modal-player iframe');
  if (existing) existing.remove();
  
  const iframe = document.createElement('iframe');
  iframe.src = url;
  iframe.allowFullscreen = true;
  iframe.allow = 'autoplay; fullscreen; encrypted-media';
  iframe.style.width = '100%';
  iframe.style.height = '100%';
  iframe.style.border = 'none';
  iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups allow-presentation allow-popups-to-escape-sandbox allow-top-navigation');
  
  const playerContainer = document.getElementById('modal-player');
  if (playerContainer) {
    // Limpiar el contenedor
    playerContainer.innerHTML = '';
    playerContainer.appendChild(iframe);
  }
}

function closeModal(e) {
  if (e.target === document.getElementById('modal-overlay')) closeModalBtn();
}

function closeModalBtn() {
  const modalOverlay = document.getElementById('modal-overlay');
  if (modalOverlay) modalOverlay.classList.remove('open');
  document.body.style.overflow = '';
  const playerContainer = document.getElementById('modal-player');
  if (playerContainer) playerContainer.innerHTML = '';
  const placeholder = document.getElementById('player-placeholder');
  if (placeholder) placeholder.style.display = 'flex';
}

// 🔍 BÚSQUEDA
async function handleSearch(q) {
  clearTimeout(searchTimeout);
  const box = document.getElementById('search-results');
  if (!q || q.length < 2) { 
    if (box) box.classList.remove('open'); 
    return; 
  }
  searchTimeout = setTimeout(async () => {
    const data = await tmdb('/search/multi', { query: q });
    const items = (data.results || []).filter(i => i.media_type !== 'person').slice(0,7);
    if (items.length === 0 || !box) { 
      if (box) box.classList.remove('open'); 
      return; 
    }
    box.innerHTML = items.map(item => {
      const title = item.title || item.name || '';
      const year = (item.release_date || item.first_air_date || '').slice(0,4);
      const type = item.media_type === 'tv' ? 'Serie' : 'Película';
      return `<div class="search-result-item" onclick="openItem(${item.id},'${item.media_type}')">
        <img class="search-thumb" src="${posterUrl(item.poster_path, 'w92')}" alt="${title}">
        <div class="search-info">
          <div class="name">${title}</div>
          <div class="meta">${type} ${year ? '· '+year : ''} · ★${item.vote_average?.toFixed(1)||'—'}</div>
        </div>
      </div>`;
    }).join('');
    box.classList.add('open');
  }, 350);
}

// 🧹 EVENTOS GLOBALES
document.addEventListener('click', (e) => {
  const wrapper = document.querySelector('.search-wrapper');
  const results = document.getElementById('search-results');
  if (wrapper && results && !wrapper.contains(e.target)) {
    results.classList.remove('open');
  }
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModalBtn(); });

// 🚀 INICIO
buildGenreTabs();
loadTrending();