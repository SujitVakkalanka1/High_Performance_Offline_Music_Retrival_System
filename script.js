
const fileInput   = document.getElementById('fileInput');
const songList    = document.getElementById('songList');
const songCount   = document.getElementById('songCount');
const emptyState  = document.getElementById('emptyState');


const coverArt    = document.getElementById('coverArt');
const songName    = document.getElementById('songName');
const songArtist  = document.getElementById('songArtist');

const audio       = document.getElementById('audioPlayer');

const playPauseBtn = document.getElementById('playPauseBtn');
const prevBtn      = document.getElementById('prevBtn');
const nextBtn      = document.getElementById('nextBtn');


const seekSlider   = document.getElementById('seekSlider');
const currentTime  = document.getElementById('currentTime');
const duration     = document.getElementById('duration');


const volumeSlider = document.getElementById('volumeSlider');
const volumeLabel  = document.getElementById('volumeLabel');
const volumeIcon   = document.getElementById('volumeIcon');


const themeToggle  = document.getElementById('themeToggle');
const themeIcon    = document.getElementById('themeIcon');
const themeLabel   = document.getElementById('themeLabel');



let songs        = []; 
let currentIndex = -1;   
let isPlaying    = false;


themeToggle.addEventListener('click', function () {
  const html = document.documentElement;
  const isDark = html.getAttribute('data-theme') === 'dark';

  if (isDark) {
    html.setAttribute('data-theme', 'light');
    themeIcon.textContent  = '☽';
    themeLabel.textContent = 'Dark Mode';
  } else {
    html.setAttribute('data-theme', 'dark');
    themeIcon.textContent  = '☀';
    themeLabel.textContent = 'Light Mode';
  }
});



fileInput.addEventListener('change', function () {

  const files = Array.from(this.files);

  files.forEach(function (file) {

    const url = URL.createObjectURL(file);


    const displayName = file.name.replace(/\.[^/.]+$/, '');


    songs.push({ name: displayName, url: url, ext: getExtension(file.name) });

    addSongToList(displayName, getExtension(file.name), songs.length - 1);
  });

  updateEmptyState();
  updateSongCount();

  if (currentIndex === -1 && songs.length > 0) {
    loadSong(0);
  }

  this.value = '';
});

function getExtension(filename) {
  return filename.split('.').pop().toUpperCase();
}

function addSongToList(name, ext, index) {
  if (emptyState && emptyState.parentNode) {
    emptyState.remove();
  }

  const li = document.createElement('li');
  li.className = 'song-item';
  li.dataset.index = index;

  li.innerHTML = `
    <span class="song-num">${index + 1}</span>
    <span class="playing-dot"></span>
    <div class="song-item-info">
      <div class="song-item-name" title="${name}">${name}</div>
      <div class="song-item-ext">${ext}</div>
    </div>
  `;

  li.addEventListener('click', function () {
    const clickedIndex = parseInt(this.dataset.index);
    if (clickedIndex === currentIndex) {
      togglePlayPause();
    } else {
      loadSong(clickedIndex);
      playAudio();
    }
  });

  songList.appendChild(li);
}

function loadSong(index) {
  if (index < 0 || index >= songs.length) return;

  currentIndex = index;
  const song   = songs[index];

  audio.src = song.url;

  songName.textContent   = song.name;
  songArtist.textContent = song.ext + ' · Local File';

  seekSlider.value = 0;
  currentTime.textContent = '0:00';
  duration.textContent    = '0:00';

  highlightActiveSong(index);
}

function highlightActiveSong(index) {
  const allItems = document.querySelectorAll('.song-item');
  allItems.forEach(function (item) {
    item.classList.remove('active');
  });

  const activeItem = document.querySelector(`.song-item[data-index="${index}"]`);
  if (activeItem) {
    activeItem.classList.add('active');
    activeItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
}

function playAudio() {
  audio.play();
  isPlaying = true;
  playPauseBtn.textContent = '⏸';
  playPauseBtn.setAttribute('aria-label', 'Pause');
  coverArt.classList.add('playing');
}

function pauseAudio() {
  audio.pause();
  isPlaying = false;
  playPauseBtn.textContent = '▶';
  playPauseBtn.setAttribute('aria-label', 'Play');
  coverArt.classList.remove('playing');
}

function togglePlayPause() {
  if (songs.length === 0) return;

  if (currentIndex === -1) {
    loadSong(0);
  }

  if (isPlaying) {
    pauseAudio();
  } else {
    playAudio();
  }
}

playPauseBtn.addEventListener('click', togglePlayPause);

nextBtn.addEventListener('click', function () {
  if (songs.length === 0) return;
  const nextIndex = (currentIndex + 1) % songs.length;
  loadSong(nextIndex);
  playAudio();
});

prevBtn.addEventListener('click', function () {
  if (songs.length === 0) return;

  if (audio.currentTime > 3) {
    audio.currentTime = 0;
    return;
  }

  const prevIndex = (currentIndex - 1 + songs.length) % songs.length;
  loadSong(prevIndex);
  playAudio();
});

audio.addEventListener('ended', function () {
  if (songs.length > 1) {
    const nextIndex = (currentIndex + 1) % songs.length;
    loadSong(nextIndex);
    playAudio();
  } else {
    pauseAudio();
    seekSlider.value = 0;
    currentTime.textContent = '0:00';
  }
});

audio.addEventListener('timeupdate', function () {
  if (!audio.duration) return;

  const progress = (audio.currentTime / audio.duration) * 100;
  seekSlider.value = progress;

  currentTime.textContent = formatTime(audio.currentTime);
  duration.textContent    = formatTime(audio.duration);
});

audio.addEventListener('loadedmetadata', function () {
  duration.textContent = formatTime(audio.duration);
});

seekSlider.addEventListener('input', function () {
  if (!audio.duration) return;
  audio.currentTime = (this.value / 100) * audio.duration;
});

function formatTime(seconds) {
  if (isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return mins + ':' + (secs < 10 ? '0' : '') + secs;
}

audio.volume = parseFloat(volumeSlider.value);

volumeSlider.addEventListener('input', function () {
  const vol = parseFloat(this.value);
  audio.volume = vol;

  volumeLabel.textContent = Math.round(vol * 100) + '%';

  if (vol === 0) {
    volumeIcon.textContent = '🔇';
  } else if (vol < 0.4) {
    volumeIcon.textContent = '🔈';
  } else if (vol < 0.7) {
    volumeIcon.textContent = '🔉';
  } else {
    volumeIcon.textContent = '🔊';
  }
});

let lastVolume = 0.8;
volumeIcon.addEventListener('click', function () {
  if (audio.volume > 0) {
    lastVolume = audio.volume;
    audio.volume = 0;
    volumeSlider.value = 0;
    volumeLabel.textContent = '0%';
    volumeIcon.textContent  = '🔇';
  } else {
    audio.volume = lastVolume;
    volumeSlider.value = lastVolume;
    volumeLabel.textContent = Math.round(lastVolume * 100) + '%';
    volumeIcon.textContent  = '🔊';
  }
});

function updateSongCount() {
  const count = songs.length;
  songCount.textContent = count === 1 ? '1 track' : count + ' tracks';
}

function updateEmptyState() {
  if (songs.length > 0 && document.getElementById('emptyState')) {
    document.getElementById('emptyState').remove();
  }
}
