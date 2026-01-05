/* TuneNest integrated player + live search
   Replace existing script.js with this file.
   Make sure /songs and /covers exist (filenames expected like songs/1.mp3, covers/1.jpg)
*/

console.log("TuneNest player + search loaded");

// ---------- songs array (update file names if yours differ) ----------
const songs = [
  { songName: "Warriyo - Mortals [NCS Release]", filePath: "songs/1.mp3", coverPath: "covers/1.jpg", artist: "NCS" },
  { songName: "Cielo - Huma-Huma", filePath: "songs/2.mp3", coverPath: "covers/2.jpg", artist: "Cielo" },
  { songName: "DEAF KEV - Invincible [NCS Release]-320k", filePath: "songs/3.mp3", coverPath: "covers/3.jpg", artist: "DEAF KEV" },
  { songName: "Different Heaven & EH!DE - My Heart [NCS Release]", filePath: "songs/4.mp3", coverPath: "covers/4.jpg", artist: "Different Heaven" },
  { songName: "Janji - Heroes Tonight", filePath: "songs/5.mp3", coverPath: "covers/5.jpg", artist: "Janji" },
  { songName: "Rabba - Salam-e-Ishq", filePath: "songs/6.mp3", coverPath: "covers/6.jpg", artist: "Salam-e-Ishq" },
  { songName: "Sakhiyaan - Salam-e-Ishq", filePath: "songs/7.mp3", coverPath: "covers/7.jpg", artist: "Salam-e-Ishq" },
  { songName: "Bhula Dena - Salam-e-Ishq", filePath: "songs/8.mp3", coverPath: "covers/8.jpg", artist: "Salam-e-Ishq" },
  { songName: "Tumhari Kasam - Salam-e-Ishq", filePath: "songs/9.mp3", coverPath: "covers/9.jpg", artist: "Salam-e-Ishq" },
  { songName: "Na Jaana - Salam-e-Ishq", filePath: "songs/10.mp3", coverPath: "covers/10.jpg", artist: "Salam-e-Ishq" },
  { songName: "Glae lag ja_De Dana Dan", filePath: "songs/11.mp3", coverPath: "covers/11.jpg", artist: "Bipul Kumar" },
  { songName: "Bangabandhu 7th March Speech", filePath: "songs/12.mp3", coverPath: "covers/12.jpg", artist: "Sheikh Mujibur Rahman" },
  { songName: "Joy Bangla Theme Song", filePath: "songs/13.mp3", coverPath: "covers/13.jpg", artist: "Mahedi Bhuiyan" },
  { songName: "Janam janam", filePath: "songs/14.mp3", coverPath: "covers/14.jpg", artist: "Arijit Singh" },
];

// ---------- UI elements ----------
const audio = new Audio(songs[0].filePath);
let songIndex = 0;

const songListContainer = document.getElementById('songListContainer');
const recentGrid = document.getElementById('recentGrid');
const recommendedGrid = document.getElementById('recommendedGrid');

const masterPlayBtn = document.getElementById('masterPlay');
const playPausePath = document.getElementById('playPausePath');
const previousBtn = document.getElementById('previous');
const nextBtn = document.getElementById('next');

const progressBar = document.getElementById('progressBar');
const progressFill = document.getElementById('progressFill');
const currentTimeEl = document.getElementById('currentTime');
const durationTimeEl = document.getElementById('durationTime');

const nowPlayingImg = document.getElementById('nowPlayingImg');
const masterSongName = document.getElementById('masterSongName');
const masterSongArtist = document.getElementById('masterSongArtist');

const songSearchInput = document.getElementById('songSearch');
const globalSearchInput = document.getElementById('globalSearch');

const volumeSlider = document.getElementById('volumeSlider');
const volumeLevel = document.getElementById('volumeLevel');

// ---------- helpers ----------
function formatTime(sec) {
  if (!sec || isNaN(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function setPlayIconToPause() {
  playPausePath.setAttribute('d', 'M6 19h4V5H6v14zm8-14v14h4V5h-4z');
}
function setPauseIconToPlay() {
  playPausePath.setAttribute('d', 'M8 5v14l11-7z');
}

// ---------- populate song list rows ----------
function createSongRow(song, index) {
  const row = document.createElement('div');
  row.className = 'song-row';
  row.dataset.index = index;

  const left = document.createElement('div');
  left.className = 'song-left';

  const img = document.createElement('img');
  img.src = song.coverPath || 'covers/1.jpg';
  img.alt = song.songName;

  const meta = document.createElement('div');
  meta.className = 'song-meta';
  const title = document.createElement('h4');
  title.innerText = song.songName;
  const artist = document.createElement('p');
  artist.innerText = song.artist || '';

  meta.appendChild(title);
  meta.appendChild(artist);
  left.appendChild(img);
  left.appendChild(meta);

  const controls = document.createElement('div');
  controls.className = 'song-controls';

  const playBtn = document.createElement('button');
  playBtn.className = 'song-play-btn';
  playBtn.innerHTML = '▶'; // simple symbol
  playBtn.title = 'Play';
  playBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    playByIndex(index);
  });

  controls.appendChild(playBtn);

  row.appendChild(left);
  row.appendChild(controls);

  // clicking row also plays
  row.addEventListener('click', () => playByIndex(index));

  return row;
}

function populateSongList(filterText = '') {
  // filter songs by title or artist
  const q = filterText.trim().toLowerCase();
  songListContainer.innerHTML = '';
  songs.forEach((s, i) => {
    if (!q || s.songName.toLowerCase().includes(q) || (s.artist && s.artist.toLowerCase().includes(q))) {
      const r = createSongRow(s, i);
      songListContainer.appendChild(r);
    }
  });
}

// ---------- populate music cards (recent + recommended) ----------
function createMusicCard(song, index) {
  const card = document.createElement('div');
  card.className = 'music-card';
  card.dataset.index = index;

  const img = document.createElement('img');
  img.className = 'album-art';
  img.src = song.coverPath || 'covers/1.jpg';
  img.alt = song.songName;

  const info = document.createElement('div');
  info.className = 'music-info';
  const h3 = document.createElement('h3'); h3.innerText = song.songName;
  const p = document.createElement('p'); p.innerText = song.artist || '';

  info.appendChild(h3);
  info.appendChild(p);
  card.appendChild(img);
  card.appendChild(info);

  card.addEventListener('click', () => playByIndex(index));
  return card;
}

function populateGrids() {
  recentGrid.innerHTML = '';
  recommendedGrid.innerHTML = '';
  // first 4 -> recent, next 4 -> recommended (wrap if less)
  for (let i = 0; i < 4; i++) {
    const idx = i % songs.length;
    recentGrid.appendChild(createMusicCard(songs[idx], idx));
  }
  for (let i = 4; i < 8; i++) {
    const idx = i % songs.length;
    recommendedGrid.appendChild(createMusicCard(songs[idx], idx));
  }
}

// ---------- play logic ----------
function playByIndex(index) {
  songIndex = index;
  audio.src = songs[songIndex].filePath;
  audio.currentTime = 0;
  audio.play();
  updateMasterUI();
  setPlayIconToPause();
}

function updateMasterUI() {
  const s = songs[songIndex];
  masterSongName.innerText = s.songName;
  masterSongArtist.innerText = s.artist || '';
  nowPlayingImg.src = s.coverPath || 'covers/1.jpg';
  // highlight currently playing row/card (simple visual: add border)
  document.querySelectorAll('.song-row').forEach(r => r.style.boxShadow = 'none');
  const currentRow = document.querySelector(`.song-row[data-index='${songIndex}']`);
  if (currentRow) currentRow.style.boxShadow = '0 6px 18px rgba(0,0,0,0.12)';
}

// ---------- master play/pause ----------
masterPlayBtn.addEventListener('click', () => {
  if (audio.paused || audio.currentTime <= 0) {
    audio.play();
    setPlayIconToPause();
  } else {
    audio.pause();
    setPauseIconToPlay();
  }
});

// when audio ends -> go to next automatically
audio.addEventListener('ended', () => {
  nextTrack();
});

// next/previous
nextBtn.addEventListener('click', nextTrack);
previousBtn.addEventListener('click', () => {
  if (songIndex <= 0) songIndex = 0;
  else songIndex--;
  audio.src = songs[songIndex].filePath;
  audio.currentTime = 0;
  audio.play();
  updateMasterUI();
  setPlayIconToPause();
});

function nextTrack() {
  if (songIndex >= songs.length - 1) songIndex = 0;
  else songIndex++;
  audio.src = songs[songIndex].filePath;
  audio.currentTime = 0;
  audio.play();
  updateMasterUI();
  setPlayIconToPause();
}

// ---------- progress updates + seeking ----------
audio.addEventListener('timeupdate', () => {
  if (!audio.duration) return;
  const pct = (audio.currentTime / audio.duration) * 100;
  progressFill.style.width = pct + '%';
  currentTimeEl.innerText = formatTime(audio.currentTime);
  durationTimeEl.innerText = formatTime(audio.duration);
});

progressBar.addEventListener('click', (e) => {
  const rect = progressBar.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const pct = clickX / rect.width;
  if (audio.duration) audio.currentTime = pct * audio.duration;
});

// ---------- volume control ----------
volumeSlider.addEventListener('click', (e) => {
  const rect = volumeSlider.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const pct = Math.max(0, Math.min(1, clickX / rect.width));
  volumeLevel.style.width = (pct * 100) + '%';
  audio.volume = pct;
});

// ---------- search (live) ----------
songSearchInput.addEventListener('input', (e) => {
  populateSongList(e.target.value);
});

globalSearchInput.addEventListener('input', (e) => {
  // also mirror into list search for convenience
  songSearchInput.value = e.target.value;
  populateSongList(e.target.value);
});

// keyboard space toggles play/pause
document.addEventListener('keydown', (ev) => {
  if (ev.code === 'Space') {
    ev.preventDefault();
    if (audio.paused) { audio.play(); setPlayIconToPause(); }
    else { audio.pause(); setPauseIconToPlay(); }
  }
});

// ---------- init ----------
function init() {
  populateSongList(''); // full list
  populateGrids();
  updateMasterUI();
  setPauseIconToPlay();
  audio.volume = 0.7;
  volumeLevel.style.width = (audio.volume * 100) + '%';
  // ensure the audio src is set so metadata loads
  audio.src = songs[songIndex].filePath;
  audio.addEventListener('loadedmetadata', () => {
    durationTimeEl.innerText = formatTime(audio.duration);
  });
}

init();
w