console.log("Starting");
let currentSong = new Audio(); // Defining the currentSong as Global variable
let songs = []; // Defining the list of songs as an empty array
let currFolder; // Current folder

const proxyUrl = 'https://cors-anywhere.herokuapp.com/'; // Proxy server URL

// Using fetch API to fetch the list of songs
async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`${proxyUrl}http://127.0.0.1:3000/${currFolder}/`);
    let response = await a.text(); // Response in form of text string

    let div = document.createElement("div");
    div.innerHTML = response; // Putting the text string as HTML response in the div
    let as = div.getElementsByTagName("a"); // Getting anchor elements

    songs = [];

    for (let i = 0; i < as.length; i++) {
        if (as[i].href.endsWith(".mp3")) // Considering only those a's whose href ends with .mp3
        {
            songs.push(as[i].href.split(`/${currFolder}/`)[1]); // Taking the part after the folder
        }
    }

    // Showing all the songs inside the playlist
    let songsUL = document.querySelector(".songsList ul");
    songsUL.innerHTML = ""; // Clearing the list before adding new songs
    for (const song of songs) {
        songsUL.innerHTML += `<li>
        <img class="invert" src="music.svg" alt="music">
        <div class="songDetails">
            <h6>${decodeURI(song).split(".mp3")[0]}</h6>
            <p>Suyash</p>
        </div>
        <img class="playNow" src="play.svg" alt="Play">
    </li>`;
    }

    // Attaching an event listener to each of the songs
    Array.from(document.querySelectorAll(".songsList li")).forEach(element => {
        element.addEventListener("click", () => {
            playMusic(element.querySelector(".songDetails h6").innerHTML + ".mp3");
            adjustHighlightAndBrightness();
        });
    });
}

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track; // Use the track directly without appending ".mp3"
    if (!pause) {
        currentSong.play(); // Playing the audio
        playPause.src = "pausebtn.svg"; // When songs start playing
    }
    document.querySelector(".songTime").innerHTML = "00:00 / 00:00";
    document.querySelector(".songInfo").innerHTML = decodeURI(track);
}

const adjustHighlightAndBrightness = () => {
    document.querySelector(".aboveBar").style.opacity = 1;
    document.querySelector(".playbar").style.filter = 'brightness(1)';
};

function convertToMMSS(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getAllAlbums() {
    let a = await fetch(`${proxyUrl}http://127.0.0.1:3000/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let allAs = div.getElementsByTagName("a");
    console.log(allAs);

    let cardContainer = document.querySelector(".cardContainer");
    cardContainer.innerHTML = "";

    let array = Array.from(allAs);
    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes("/songs/")) {
            let folder = e.href.split("/").slice(-2)[0];
            console.log(folder);

            let info = await fetch(`${proxyUrl}http://127.0.0.1:3000/songs/${folder}/info.json`);
            let response = await info.json();
            console.log(response);

            cardContainer.innerHTML += `
                <div data-folder="${folder}" class="card">
                <div class="play">
                    <img src="play.svg" alt="">
                </div>
                <img src="/songs/${folder}/cover.jpeg" alt="">
                <h4>${response.title}</h4>
                <p>${response.description}</p>
            </div>`;
        }
    }

    Array.from(document.getElementsByClassName("card")).forEach(element => {
        element.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
        });
    });
}

async function main() {
    await getSongs("songs/rhymes"); // Since songs is a global variable, no need to return it
    playMusic(songs[0], true);

    getAllAlbums();

    document.getElementById("playPause").addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            playPause.src = "pausebtn.svg";
            adjustHighlightAndBrightness();
        } else {
            currentSong.pause();
            playPause.src = "playbtn.svg";
        }
    });

    document.getElementById("next").addEventListener("click", () => {
        let currentSongIndex = songs.indexOf(currentSong.src.split(`/${currFolder}/`)[1]);
        if (currentSongIndex === songs.length - 1) {
            playMusic(songs[0]);
        } else {
            playMusic(songs[currentSongIndex + 1]);
        }
        adjustHighlightAndBrightness();
    });

    document.getElementById("previous").addEventListener("click", () => {
        let currentSongIndex = songs.indexOf(currentSong.src.split(`/${currFolder}/`)[1]);
        if (currentSongIndex === 0) {
            playMusic(songs[songs.length - 1]);
        } else {
            playMusic(songs[currentSongIndex - 1]);
        }
        adjustHighlightAndBrightness();
    });

    currentSong.addEventListener("timeupdate", () => {
        let duration = currentSong.duration;
        let currentTime = currentSong.currentTime;
        document.querySelector(".songTime").innerHTML = `${convertToMMSS(Math.floor(currentTime))} / ${convertToMMSS(Math.floor(duration))}`;
        let progressPercent = (currentTime / duration) * 100;
        document.querySelector(".progressBar").style.width = `${progressPercent}%`;
        document.querySelector(".circle").style.left = `${progressPercent}%`;
    });

    document.querySelector(".seekbar").addEventListener("click", (event) => {
        let seekbar = document.querySelector(".seekbar");
        let rect = seekbar.getBoundingClientRect();
        let offsetX = event.clientX - rect.left;
        let percent = (offsetX / rect.width) * 100;
        document.querySelector(".circle").style.left = `${percent}%`;
        document.querySelector(".progressBar").style.width = `${percent}%`;
        currentSong.currentTime = (percent / 100) * currentSong.duration;
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%";
    });

    document.querySelector(".range input").addEventListener("change", (event) => {
        currentSong.volume = (event.target.value) / 100;
    });

    document.getElementById("vol").addEventListener("click", () => {
        currentSong.volume = 0;
        vol.src = "mute.svg";
    });
}

main();
