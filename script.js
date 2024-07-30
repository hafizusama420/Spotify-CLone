console.log("lets write some function");
let currentSong = new Audio();
currentSong.volume = 0.5; // Set initial volume (0.0 to 1.0)
let songs = [];
let currentSongIndex = -1; // Track the index of the current song

async function getSongs() {
    try {
        let response = await fetch("/songs");
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        let text = await response.text();
        let div = document.createElement("div");
        div.innerHTML = text;
        let as = div.getElementsByTagName("a");
        songs = [];
        for (let index = 0; index < as.length; index++) {
            const element = as[index];
            if (element.href.endsWith(".mp3")) {
                songs.push(element.href.split("/songs/")[1]);
            }
        }
        console.log("Songs fetched:", songs);
        return songs;
    } catch (error) {
        console.error("Failed to fetch songs:", error);
    }
}

const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const formattedSeconds = remainingSeconds < 10 ? '0' + remainingSeconds : remainingSeconds;
    return `${minutes}:${formattedSeconds}`;
};

const playmusic = (track) => {
    currentSong.src = "/songs/" + track;
    currentSong.play();
    play.src = "pause.svg";
    document.querySelector(".songinfo").innerHTML = track;
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";

    // Show volume control
    document.querySelector(".volume-control").style.display = 'block';

    // Update current song index
    currentSongIndex = songs.indexOf(track);

    // Add event listener to update the duration
    currentSong.addEventListener("loadedmetadata", () => {
        const duration = formatTime(currentSong.duration);
        document.querySelector(".songtime").innerHTML = `00:00 / ${duration}`;
    });

    // Update current time and seekbar position as the song progresses
    currentSong.addEventListener("timeupdate", () => {
        const currentTime = currentSong.currentTime;
        const duration = currentSong.duration;
        const percentage = (currentTime / duration) * 100;
        const formattedCurrentTime = formatTime(currentTime);
        const formattedDuration = formatTime(duration);

        document.querySelector(".songtime").innerHTML = `${formattedCurrentTime} / ${formattedDuration}`;

        // Update seekbar circle position
        const circle = document.querySelector(".seekbar .circle");
        circle.style.left = `calc(${percentage}% - ${circle.offsetWidth / 2}px)`;

        // Update seekbar background color
        const seekbar = document.querySelector(".seekbar");
        seekbar.style.background = `linear-gradient(to right, #007bff ${percentage}%, #ddd ${percentage}%)`;
    });
};

// Volume control functionality
const volumeControl = document.querySelector(".volume-control");
const volumeCircle = document.querySelector(".volume-control .circle");

const updateVolume = (event) => {
    const volumeControlRect = volumeControl.getBoundingClientRect();
    const clickX = event.clientX - volumeControlRect.left;
    const percentage = Math.max(0, Math.min(1, clickX / volumeControlRect.width));
    currentSong.volume = percentage;
    volumeCircle.style.left = `calc(${percentage * 100}% - ${volumeCircle.offsetWidth / 2}px)`;
    volumeControl.style.background = `linear-gradient(to right, #007bff ${percentage * 100}%, #ddd ${percentage * 100}%)`;
};

volumeControl.addEventListener('click', updateVolume);

// Function to play the previous song
const playPreviousSong = () => {
    if (songs.length > 0) {
        currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length; // Move to previous song, loop if at start
        playmusic(songs[currentSongIndex]);
    }
};

// Function to play the next song
const playNextSong = () => {
    if (songs.length > 0) {
        currentSongIndex = (currentSongIndex + 1) % songs.length; // Move to next song, loop if at end
        playmusic(songs[currentSongIndex]);
    }
};

// Seekbar functionality
const seekbar = document.querySelector(".seekbar");

const updateSeekbar = (event) => {
    const seekbarRect = seekbar.getBoundingClientRect();
    const clickX = event.clientX - seekbarRect.left;
    const percentage = Math.max(0, Math.min(1, clickX / seekbarRect.width));
    const newTime = percentage * currentSong.duration;
    currentSong.currentTime = newTime;
};

seekbar.addEventListener('click', updateSeekbar);

async function main() {
    songs = await getSongs();
    console.log(songs);

    let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0];

    for (const song of songs) {
        let formattedSong = song.replace(/%20/g, " ");
        songUL.innerHTML += `<li class="song-item">    
        <div class="left-section">
            <img class="invert" src="music.svg" alt="">
            <div class="info">
                <div>${formattedSong}</div>
                <div>Chahat Fateh </div>
            </div>
        </div>
        <img width="35px" class="play1" src="play.svg" alt="play">
        </li>`;
    }



    // Attach an event listener to each song
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            playmusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        });
    });

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "pause.svg";
            // Ensure volume control remains visible
            document.querySelector(".volume-control").style.display = 'block'; // Show volume control
        } else {
            currentSong.pause();
            play.src = "play.svg";
            // Ensure volume control remains visible
            document.querySelector(".volume-control").style.display = 'block'; // Keep it visible
        }
    });

    // Initialize volume control
    const initialVolume = currentSong.volume;
    volumeCircle.style.left = `calc(${initialVolume * 100}% - ${volumeCircle.offsetWidth / 2}px)`;
    volumeControl.style.background = `linear-gradient(to right, #007bff ${initialVolume * 100}%, #ddd ${initialVolume * 100}%)`;
    volumeControl.style.display = 'block'; // Initially hide volume control

    // Attach event listeners for previous and next buttons
    document.getElementById("previous").addEventListener("click", playPreviousSong);
    document.getElementById("next").addEventListener("click", playNextSong);

    // for hamburger

    document.querySelector(".hamburger").addEventListener("click", ()=>{
        document.querySelector(".left").style.left = "0"
    })
    document.querySelector(".close").addEventListener("click", ()=>{
        document.querySelector(".left").style.left = "-120%"
    })
};

main();
