const audio = document.getElementById("audio");
const fileInput = document.getElementById("fileInput");
const songList = document.getElementById("songList");
const songTitle = document.getElementById("songTitle");
const playBtn = document.getElementById("playBtn");
const progress = document.getElementById("progress");
const volume = document.getElementById("volume");
const timeDisplay = document.getElementById("time");
const volumePercent = document.getElementById("volumePercent");
const themeBtn = document.getElementById("themeBtn");

let songs = [];
let currentIndex = -1;

function addSong() {
    const file = fileInput.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    songs.push({ name: file.name, url: url });
    renderPlaylist();
    fileInput.value = "";
}

function renderPlaylist() {
    songList.innerHTML = "";
    songs.forEach((song, index) => {
        const li = document.createElement("li");
        li.textContent = song.name;
        li.onclick = () => loadSong(index);

        const delBtn = document.createElement("button");
        delBtn.textContent = "❌";
        delBtn.onclick = (e) => {
            e.stopPropagation();
            songs.splice(index, 1);
            renderPlaylist();
        };

        li.appendChild(delBtn);
        songList.appendChild(li);
    });
}

function loadSong(index) {
    currentIndex = index;
    audio.src = songs[index].url;
    songTitle.textContent = songs[index].name;
    audio.play();
    playBtn.textContent = "⏸";
}

function togglePlay() {
    if (audio.paused) {
        audio.play();
        playBtn.textContent = "⏸";
    } else {
        audio.pause();
        playBtn.textContent = "▶";
    }
}

function prevSong() {
    if (currentIndex > 0) loadSong(currentIndex - 1);
}

function nextSong() {
    if (currentIndex < songs.length - 1) loadSong(currentIndex + 1);
}

audio.addEventListener("timeupdate", () => {
    progress.max = audio.duration;
    progress.value = audio.currentTime;

    timeDisplay.textContent =
        formatTime(audio.currentTime) + " / " + formatTime(audio.duration);
});

progress.addEventListener("input", () => {
    audio.currentTime = progress.value;
});

function formatTime(time) {
    if (!time) return "0:00";
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return min + ":" + (sec < 10 ? "0" : "") + sec;
}

volume.addEventListener("input", () => {
    audio.volume = volume.value;
    volumePercent.textContent = Math.round(volume.value * 100) + "%";
});

themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    document.body.classList.toggle("light");
});
