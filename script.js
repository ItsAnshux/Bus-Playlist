/* Driver's Choice — jukebox logic */

const audio = document.getElementById('audioPlayer');

const els = {
  cover: document.getElementById('coverArt'),
  title: document.getElementById('trackTitle'),
  artist: document.getElementById('trackArtist'),
  marqueeTitle: document.getElementById('marqueeTitle'),
  marqueeTitle2: document.getElementById('marqueeTitle2'),
  playBtn: document.getElementById('playBtn'),
  prevBtn: document.getElementById('prevBtn'),
  nextBtn: document.getElementById('nextBtn'),
  shuffleBtn: document.getElementById('shuffleBtn'),
  road: document.getElementById('roadBar'),
  roadFill: document.getElementById('roadFill'),
  busMarker: document.getElementById('busMarker'),
  timeCurrent: document.getElementById('timeCurrent'),
  timeTotal: document.getElementById('timeTotal'),
  spotifyLink: document.getElementById('spotifyLink'),
  ytmusicLink: document.getElementById('ytmusicLink'),
  onlineCount: document.getElementById('onlineCount'),
  hornBtn: document.getElementById('hornBtn'),
  jhalar: document.getElementById('jhalar'),
};

let playlist = [];
let currentIndex = 0;
let shuffleOn = true;
let playedOrder = [];

// ---------- Build the jhalar (hanging tassels) ----------
function buildJhalar(){
  const count = 18;
  for (let i = 0; i < count; i++){
    const t = document.createElement('div');
    t.className = 'tassel';
    t.style.animationDuration = (2.2 + Math.random() * 1.2) + 's';
    els.jhalar.appendChild(t);
  }
}

// ---------- Load playlist ----------
async function loadPlaylist(){
  try{
    const res = await fetch('songs.json', { cache: 'no-store' });
    playlist = await res.json();
  } catch (err){
    console.error('Could not load songs.json', err);
    playlist = [];
  }
  if (!playlist.length) return;

  currentIndex = Math.floor(Math.random() * playlist.length);
  loadTrack(currentIndex, { autoplay: false });
}

// ---------- Track loading ----------
function loadTrack(index, { autoplay = true } = {}){
  const track = playlist[index];
  if (!track) return;
  currentIndex = index;

  els.cover.src = track.cover;
  els.cover.alt = `${track.title} artwork`;
  els.title.textContent = track.title;
  els.artist.textContent = track.artist;
  els.marqueeTitle.textContent = `${track.title} — ${track.artist}`;
  els.marqueeTitle2.textContent = `${track.title} — ${track.artist}`;

  els.spotifyLink.href = track.spotify || '#';
  els.ytmusicLink.href = track.ytmusic || '#';

  audio.src = track.src;
  resetRoad();

  if (autoplay){
    audio.play().catch(() => {});
  }
}

// ---------- Play / pause ----------
function togglePlay(){
  if (audio.paused){
    audio.play().catch(() => {});
  } else {
    audio.pause();
  }
}

audio.addEventListener('play', () => {
  els.playBtn.textContent = '⏸';
  els.cover.style.transform = 'scale(1.03)';
});
audio.addEventListener('pause', () => {
  els.playBtn.textContent = '▶';
  els.cover.style.transform = 'scale(1)';
});

// ---------- Next / previous ----------
function nextTrack(){
  if (!playlist.length) return;
  let index;
  if (shuffleOn){
    if (playlist.length === 1){
      index = 0;
    } else {
      do { index = Math.floor(Math.random() * playlist.length); }
      while (index === currentIndex);
    }
  } else {
    index = (currentIndex + 1) % playlist.length;
  }
  loadTrack(index);
}

function prevTrack(){
  if (!playlist.length) return;
  const index = (currentIndex - 1 + playlist.length) % playlist.length;
  loadTrack(index);
}

audio.addEventListener('ended', nextTrack);

// ---------- Road-shaped progress bar ----------
function resetRoad(){
  els.roadFill.style.width = '0%';
  els.busMarker.style.left = '0%';
  els.timeCurrent.textContent = '0:00';
  els.timeTotal.textContent = '0:00';
}

audio.addEventListener('loadedmetadata', () => {
  els.timeTotal.textContent = formatTime(audio.duration);
});

audio.addEventListener('timeupdate', () => {
  if (!audio.duration) return;
  const pct = (audio.currentTime / audio.duration) * 100;
  els.roadFill.style.width = pct + '%';
  els.busMarker.style.left = pct + '%';
  els.timeCurrent.textContent = formatTime(audio.currentTime);
});

els.road.addEventListener('click', (e) => {
  if (!audio.duration) return;
  const rect = els.road.getBoundingClientRect();
  const pct = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
  audio.currentTime = pct * audio.duration;
});

function formatTime(seconds){
  if (!isFinite(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// ---------- Shuffle toggle ----------
function toggleShuffle(){
  shuffleOn = !shuffleOn;
  els.shuffleBtn.classList.toggle('is-active', shuffleOn);
}

// ---------- Fake "on this route" counter ----------
function startOnlineCounter(){
  let count = 40 + Math.floor(Math.random() * 60);
  els.onlineCount.textContent = count;
  setInterval(() => {
    count += Math.floor(Math.random() * 5) - 2;
    count = Math.max(12, count);
    els.onlineCount.textContent = count;
  }, 4000);
}

// ---------- Horn easter egg ----------
function honk(){
  try{
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const now = ctx.currentTime;
    [330, 262].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.18, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now + i * 0.03);
      osc.stop(now + 0.6);
    });
  } catch (err){
    console.warn('Horn unavailable', err);
  }
}

// ---------- Wire up events ----------
els.playBtn.addEventListener('click', togglePlay);
els.nextBtn.addEventListener('click', nextTrack);
els.prevBtn.addEventListener('click', prevTrack);
els.shuffleBtn.addEventListener('click', toggleShuffle);
els.hornBtn.addEventListener('click', honk);

buildJhalar();
startOnlineCounter();
loadPlaylist();
