/* Driver's Choice — jukebox logic
   Plays audio straight from official YouTube channels via the
   YouTube IFrame Player API, with a no-repeat shuffle queue. */

const els = {
  cover: document.getElementById('coverArt'),
  title: document.getElementById('trackTitle'),
  artist: document.getElementById('trackArtist'),
  channel: document.getElementById('trackChannel'),
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
let currentIndex = -1;
let history = [];          // recently played indices (most recent last)
let upNext = [];           // shuffled queue of indices not yet played this cycle
let shuffleOn = true;
let ytPlayer = null;
let ytReady = false;
let playerCreated = false;
let progressTimer = null;
let pendingAutoplay = false;

// ---------- Jhalar (hanging tassels) ----------
function buildJhalar(){
  const count = 18;
  for (let i = 0; i < count; i++){
    const t = document.createElement('div');
    t.className = 'tassel';
    t.style.animationDuration = (2.2 + Math.random() * 1.2) + 's';
    els.jhalar.appendChild(t);
  }
}

// ---------- No-repeat shuffle queue ----------
// Refills and reshuffles once every song has played, and makes sure
// the first track of a fresh cycle isn't the same as the last track
// of the previous cycle (so it never feels like an obvious repeat).
function refillQueue(){
  const indices = playlist.map((_, i) => i);
  for (let i = indices.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  const last = history[history.length - 1];
  if (indices.length > 1 && indices[0] === last){
    indices.push(indices.shift());
  }
  upNext = indices;
}

function nextIndex(){
  if (!playlist.length) return -1;
  if (!shuffleOn){
    return (currentIndex + 1 + playlist.length) % playlist.length;
  }
  if (!upNext.length) refillQueue();
  return upNext.shift();
}

function prevIndex(){
  if (!playlist.length) return -1;
  if (history.length > 1){
    history.pop(); // drop current
    return history.pop();
  }
  return currentIndex;
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
  maybeStartFirstTrack();
}

function maybeStartFirstTrack(){
  if (!ytReady || !playlist.length || currentIndex !== -1) return;
  const idx = nextIndex();
  playTrackAt(idx, { autoplay: false });
}

// ---------- YouTube IFrame API ----------
function onYouTubeIframeAPIReady(){
  ytPlayer = new YT.Player('ytPlayerHost', {
    height: '2',
    width: '2',
    playerVars: {
      autoplay: 0,
      controls: 0,
      disablekb: 1,
      modestbranding: 1,
      playsinline: 1,
      rel: 0,
    },
    events: {
      onReady: () => {
        ytReady = true;
        maybeStartFirstTrack();
      },
      onStateChange: onPlayerStateChange,
      onError: () => nextTrack(), // skip anything that fails to play
    },
  });
}
// Must be a global for the YouTube API callback
window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;

function onPlayerStateChange(e){
  if (e.data === YT.PlayerState.ENDED){
    nextTrack();
  } else if (e.data === YT.PlayerState.PLAYING){
    els.playBtn.textContent = '⏸';
    els.cover.style.transform = 'scale(1.03)';
    startProgressTimer();
    if (els.timeTotal.textContent === '0:00'){
      els.timeTotal.textContent = formatTime(ytPlayer.getDuration());
    }
  } else if (e.data === YT.PlayerState.PAUSED){
    els.playBtn.textContent = '▶';
    els.cover.style.transform = 'scale(1)';
    stopProgressTimer();
  }
}

// ---------- Track loading ----------
function playTrackAt(index, { autoplay = true } = {}){
  const track = playlist[index];
  if (!track) return;
  currentIndex = index;
  history.push(index);
  if (history.length > 50) history.shift();

  els.cover.src = `https://img.youtube.com/vi/${track.videoId}/hqdefault.jpg`;
  els.cover.alt = `${track.title} artwork`;
  els.title.textContent = track.title;
  els.artist.textContent = track.artist || '';
  els.channel.textContent = track.channel ? `via ${track.channel}` : '';
  els.marqueeTitle.textContent = `${track.title} — ${track.artist || ''}`;
  els.marqueeTitle2.textContent = `${track.title} — ${track.artist || ''}`;

  els.spotifyLink.href = track.spotify || '#';
  els.ytmusicLink.href = track.ytmusic || '#';

  resetRoad();

  if (!ytReady){
    pendingAutoplay = autoplay;
    return;
  }

  if (autoplay){
    ytPlayer.loadVideoById(track.videoId);
  } else {
    ytPlayer.cueVideoById(track.videoId);
  }
}

// ---------- Play / pause ----------
function togglePlay(){
  if (!ytReady) return;
  const state = ytPlayer.getPlayerState();
  if (state === YT.PlayerState.PLAYING){
    ytPlayer.pauseVideo();
  } else {
    ytPlayer.playVideo();
  }
}

// ---------- Next / previous ----------
function nextTrack(){
  const idx = nextIndex();
  if (idx === -1) return;
  playTrackAt(idx, { autoplay: true });
}

function prevTrack(){
  const idx = prevIndex();
  if (idx === -1 || idx === undefined) return;
  playTrackAt(idx, { autoplay: true });
}

// ---------- Road-shaped progress bar ----------
function resetRoad(){
  els.roadFill.style.width = '0%';
  els.busMarker.style.left = '0%';
  els.timeCurrent.textContent = '0:00';
  els.timeTotal.textContent = '0:00';
}

function startProgressTimer(){
  stopProgressTimer();
  progressTimer = setInterval(() => {
    if (!ytReady) return;
    const duration = ytPlayer.getDuration();
    const current = ytPlayer.getCurrentTime();
    if (!duration) return;
    const pct = (current / duration) * 100;
    els.roadFill.style.width = pct + '%';
    els.busMarker.style.left = pct + '%';
    els.timeCurrent.textContent = formatTime(current);
    els.timeTotal.textContent = formatTime(duration);
  }, 500);
}
function stopProgressTimer(){
  if (progressTimer) clearInterval(progressTimer);
  progressTimer = null;
}

els.road.addEventListener('click', (e) => {
  if (!ytReady) return;
  const duration = ytPlayer.getDuration();
  if (!duration) return;
  const rect = els.road.getBoundingClientRect();
  const pct = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
  ytPlayer.seekTo(pct * duration, true);
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
  if (shuffleOn) upNext = [];
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
