// Pomodoro Timer
let timer;
let isStudyTime = true;

document.getElementById("startTimer").addEventListener("click", function() {
    const studyTime = parseInt(document.getElementById("studyTime").value) || 0;
    const breakTime = parseInt(document.getElementById("breakTime").value) || 0;

    if (studyTime > 0) {
        startPomodoro(studyTime * 60); // Konversi menit ke detik
    } else {
        alert("Silakan masukkan waktu belajar yang valid.");
    }
});

function startPomodoro(duration) {
    let timeLeft = duration;
    updateTimerDisplay(timeLeft);

    timer = setInterval(() => {
        timeLeft--;
        updateTimerDisplay(timeLeft);

        if (timeLeft <= 0) {
            clearInterval(timer);
            if (isStudyTime) {
                alert("Waktu belajar selesai! Saatnya istirahat.");
                startPomodoro(
                    parseInt(document.getElementById("breakTime").value) * 60
                );
            } else {
                alert("Waktu istirahat selesai! Saatnya belajar.");
                startPomodoro(
                    parseInt(document.getElementById("studyTime").value) * 60
                );
            }
            isStudyTime = !isStudyTime;
        }
    }, 1000);
}

function updateTimerDisplay(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const displayMinutes = String(minutes).padStart(2, "0");
    const displaySeconds = String(remainingSeconds).padStart(2, "0");
    document.getElementById(
        "timerDisplay"
    ).textContent = `${displayMinutes}:${displaySeconds}`;
}

// To-Do List
document.getElementById("addTodo").addEventListener("click", function() {
    const todoInput = document.getElementById("todoInput");
    const todoText = todoInput.value.trim();

    if (todoText) {
        addTodoItem(todoText);
        todoInput.value = ""; // Kosongkan input setelah menambahkan
    } else {
        alert("Silakan masukkan item to-do.");
    }
});

function addTodoItem(text) {
    const todoList = document.getElementById("todoList");
    const listItem = document.createElement("li");
    listItem.className =
        "list-group-item d-flex justify-content-between align-items-center";
    listItem.textContent = text;

    // Tombol untuk menandai selesai
    const doneButton = document.createElement("button");
    doneButton.className = "btn btn-success btn-sm";
    doneButton.textContent = "Selesai";
    doneButton.onclick = function() {
        listItem.classList.toggle("list-group-item-success");
    };

    // Tombol untuk menghapus item
    const deleteButton = document.createElement("button");
    deleteButton.className = "btn btn-danger btn-sm";
    deleteButton.textContent = "Hapus";
    deleteButton.onclick = function() {
        todoList.removeChild(listItem);
        saveTodos(); // Simpan perubahan
    };

    listItem.appendChild(doneButton);
    listItem.appendChild(deleteButton);
    todoList.appendChild(listItem);

    saveTodos(); // Simpan perubahan
}

// Penyimpanan lokal
function saveTodos() {
    const todoList = document.getElementById("todoList");
    const todos = [];
    for (let item of todoList.children) {
        todos.push(item.firstChild.textContent);
    }
    localStorage.setItem("todos", JSON.stringify(todos));
}

// Memuat To-Do List dari penyimpanan lokal saat halaman dimuat
window.onload = function() {
    const todos = JSON.parse(localStorage.getItem("todos")) || [];
    todos.forEach((todo) => addTodoItem(todo));
};

// Spotify API Credentials
const SPOTIFY_CLIENT_ID = "YOUR_CLIENT_ID"; // Ganti dengan Client ID Anda
const SPOTIFY_CLIENT_SECRET = "YOUR_CLIENT_SECRET"; // Ganti dengan Client Secret Anda
let accessToken = "";

// Fungsi untuk mendapatkan token akses dari Spotify
async function getAccessToken() {
    const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            Authorization: "Basic " + btoa(SPOTIFY_CLIENT_ID + ":" + SPOTIFY_CLIENT_SECRET),
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials",
    });
    const data = await response.json();
    accessToken = data.access_token;
}

// Fungsi untuk memutar musik
async function playMusic(trackUri) {
    if (!accessToken) {
        await getAccessToken();
    }

    const response = await fetch(`https://api.spotify.com/v1/me/player/play`, {
        method: "PUT",
        headers: {
            Authorization: "Bearer " + accessToken,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            uris: [trackUri],
        }),
    });

    if (!response.ok) {
        console.error("Error playing music:", response.statusText);
    }
}

// Modifikasi fungsi startPomodoro untuk memutar musik saat timer dimulai
function startPomodoro(duration) {
    let timeLeft = duration;
    updateTimerDisplay(timeLeft);

    // Memutar musik saat timer dimulai
    playMusic("spotify:track:YOUR_TRACK_URI"); // Ganti dengan URI lagu yang ingin diputar

    timer = setInterval(() => {
        timeLeft--;
        updateTimerDisplay(timeLeft);

        if (timeLeft <= 0) {
            clearInterval(timer);
            if (isStudyTime) {
                alert("Waktu belajar selesai! Saatnya istirahat.");
                startPomodoro(
                    parseInt(document.getElementById("breakTime").value) * 60
                );
            } else {
                alert("Waktu istirahat selesai! Saatnya belajar.");
                startPomodoro(
                    parseInt(document.getElementById("studyTime").value) * 60
                );
            }
            isStudyTime = !isStudyTime;
        }
    }, 1000);
}

// Playlist
const playlist = [];

document.getElementById("addTrack").addEventListener("click", function() {
    const trackUriInput = document.getElementById("trackUriInput");
    const trackUri = trackUriInput.value.trim();

    if (trackUri) {
        addTrackToPlaylist(trackUri);
        trackUriInput.value = ""; // Kosongkan input setelah menambahkan
    } else {
        alert("Silakan masukkan URI lagu.");
    }
});

function addTrackToPlaylist(uri) {
    playlist.push(uri);
    updatePlaylistDisplay();
}

function updatePlaylistDisplay() {
    const playlistElement = document.getElementById("playlist");
    playlistElement.innerHTML = ""; // Kosongkan daftar sebelumnya

    playlist.forEach((uri, index) => {
        const listItem = document.createElement("li");
        listItem.className =
            "list-group-item d-flex justify-content-between align-items-center";
        listItem.textContent = uri;

        // Tombol untuk memutar lagu
        const playButton = document.createElement("button");
        playButton.className = "btn btn-primary btn-sm";
        playButton.textContent = "Putar";
        playButton.onclick = function() {
            playMusic(uri); // Memutar lagu dari URI
        };

        listItem.appendChild(playButton);
        playlistElement.appendChild(listItem);
    });
}

async function playMusic(trackUri) {
    if (!accessToken) {
        await getAccessToken();
    }

    const response = await fetch(`https://api.spotify.com/v1/me/player/play`, {
        method: "PUT",
        headers: {
            Authorization: "Bearer " + accessToken,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            uris: [trackUri],
        }),
    });

    if (!response.ok) {
        console.error("Error playing music:", response.statusText);
    }
}

function savePlaylist() {
    localStorage.setItem("playlist", JSON.stringify(playlist));
}

function loadPlaylist() {
    const savedPlaylist = JSON.parse(localStorage.getItem("playlist")) || [];
    savedPlaylist.forEach((uri) => addTrackToPlaylist(uri));
}

// Memuat Playlist saat halaman dimuat
window.onload = function() {
    loadPlaylist();
};