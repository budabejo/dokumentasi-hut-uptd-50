// Auto-scan images from GitHub repo images folder and create slideshow
const username = "budabejo";
const repo = "dokumentasi-hut-uptd-50";
const folder = "images";

const apiURL = `https://api.github.com/repos/${username}/${repo}/contents/${folder}`;

// state
let images = [];
let index = 0;
let playing = true;
let slideInterval = null;
const INTERVAL = 4000;

const slidesEl = document.getElementById('slides');
const loadingEl = document.getElementById('loading');
const bgm = document.getElementById('bgm');
const musicBtn = document.getElementById('musicBtn');
const slplayBtn = document.getElementById('slplay');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

function createImg(src, alt='foto') {
  const img = document.createElement('img');
  img.src = src;
  img.alt = alt;
  return img;
}

function showIndex(i) {
  const imgs = slidesEl.querySelectorAll('img');
  if (imgs.length === 0) return;
  imgs.forEach((el, idx) => {
    el.classList.toggle('show', idx === i);
  });
}

function next() {
  if (images.length === 0) return;
  index = (index + 1) % images.length;
  showIndex(index);
}

function prev() {
  if (images.length === 0) return;
  index = (index - 1 + images.length) % images.length;
  showIndex(index);
}

function startAuto() {
  stopAuto();
  slideInterval = setInterval(() => {
    next();
  }, INTERVAL);
  playing = true;
  slplayBtn.textContent = '⏯️';
}

function stopAuto() {
  if (slideInterval) { clearInterval(slideInterval); slideInterval = null; }
  playing = false;
  slplayBtn.textContent = '⏸️';
}

function togglePlay() {
  if (playing) stopAuto(); else startAuto();
}

// fetch images list from GitHub API
fetch(apiURL)
  .then(r => r.json())
  .then(list => {
    if (!Array.isArray(list)) { console.error('GitHub API error', list); loadingEl.style.display='none'; return; }
    const imgs = list.filter(f => f.name.match(/\.(jpe?g|png|gif)$/i));
    images = imgs.map(f => f.download_url);
    if (images.length === 0) {
      slidesEl.innerHTML = '<div style="padding:30px;text-align:center;color:#135D46;font-weight:700">Belum ada foto. Silakan upload gambar ke folder /images di repo ini.</div>';
      loadingEl.style.display = 'none';
      return;
    }
    // create img elements and preload
    images.forEach((url, i) => {
      const img = createImg(url);
      slidesEl.appendChild(img);
      img.addEventListener('load', () => {
        // when first image loaded, hide loader and show slideshow
        if (i === 0) {
          loadingEl.style.display = 'none';
          img.classList.add('show');
        }
      });
    });
    // start autoplay
    startAuto();
  })
  .catch(err => {
    console.error(err);
    slidesEl.innerHTML = '<div style="padding:30px;text-align:center;color:#c22">Gagal memuat gambar. Periksa nama repo/folder atau koneksi internet.</div>';
    loadingEl.style.display = 'none';
  });

// controls
musicBtn?.addEventListener('click', () => {
  if (bgm.paused) { bgm.play(); musicBtn.textContent='🎵'; }
  else { bgm.pause(); musicBtn.textContent='🔇'; }
});
slplayBtn?.addEventListener('click', () => togglePlay());
prevBtn?.addEventListener('click', () => { prev(); if (playing) { stopAuto(); } });
nextBtn?.addEventListener('click', () => { next(); if (playing) { stopAuto(); } });

// keyboard nav
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') prev();
  if (e.key === 'ArrowRight') next();
  if (e.key === ' ') { e.preventDefault(); togglePlay(); }
});
