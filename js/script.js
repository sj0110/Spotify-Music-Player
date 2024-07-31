// console.log("Starting");
let currentSong = new Audio(); // Defining the currentSong as Global variable;
let songs = []; // defining the list of songs empty array
// let folders = []; // defining the folders
let currFolder; // current folder

// Using fetch API to fetch the list of songs
async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`/${currFolder}/`);
    let response = await a.text(); // response in form of text string
    // console.log(response); 
    // getting the list of songs in the form of table object, have to parse those songs.
    let div = document.createElement("div");
    div.innerHTML = response; // putting the text string as html response in the div
    let as = div.getElementsByTagName("a"); // getting anchor element

    songs = [];

    for (let i = 0; i < as.length; i++) {
        if (as[i].href.endsWith(".mp3")) // considering only those a's whose href ends with .mp3
        {
            songs.push(as[i].href.split(`/${currFolder}/`)[1]); // will give 2 splits as array one before and one after, we're taking after one.
        }

    }

    //Showing all the songs inside the playlist
    let songsUL = document.querySelector(".songsList").getElementsByTagName("ul")[0];
    songsUL.innerHTML = ""; // clearing the list before adding new songs
    for (const song of songs) {
        songsUL.innerHTML = songsUL.innerHTML + `<li>
        <img class="invert" src="img/music.svg" alt="music">
        <div class="songDetails">
            <h6>${decodeURI(song).split(".mp3")[0]}</h6>
            <p>Suyash</p>
        </div>
        <img class="playNow" src="img/play.svg" alt="Play">
    </li>`;
    }

    // Attaching an event listener to each of the songs
    Array.from(document.querySelector(".songsList").getElementsByTagName("li")).forEach(element => {
        element.addEventListener("click", () => {
            playMusic(element.querySelector(".songDetails").firstElementChild.innerHTML + ".mp3");
            adjustHighlightAndBrightness();
        });
    });
    return songs; // since songs is global variable not required waise but to play 1st song it is required.

}
//getSongs function returns a promise that has to be fulfilled so everything should go inside the main function which needs to be called.

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track; // Use the track directly without appending ".mp3"
    // Setting the source of the audio element
    if (!pause) {
        currentSong.play(); // Playing the audio
        playPause.src = "img/pausebtn.svg"; // When songs start playing
    }
    document.querySelector(".songTime").innerHTML = "00:00 / 00:00";
    document.querySelector(".songInfo").innerHTML = decodeURI(track);
}

const adjustHighlightAndBrightness = () => {
    document.querySelector(".aboveBar").style.opacity = 1;
    document.querySelector(".playbar").style.filter = 'brightness(1)';
};

function convertToMMSS(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00"
    // Calculate minutes
    const minutes = Math.floor(seconds / 60);
    // Calculate remaining seconds
    const remainingSeconds = seconds % 60;

    // Format minutes and seconds to ensure two digits
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    // Combine minutes and seconds in MM:SS format
    return `${formattedMinutes}:${formattedSeconds}`;
}
async function getAllAlbums() {
    let a = await fetch(`/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let allAs = div.getElementsByTagName("a");
    // console.log(allAs);

    cardContainer = document.querySelector(".cardContainer");
    cardContainer.innerHTML = "";

    let array = Array.from(allAs);
    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes("/songs/") && !e.href.includes(".htaccess")) {
            let folder = e.href.split(`/`).slice(-2)[0];
            // console.log(folder);

            let info = await fetch(`/songs/${folder}/info.json`);
            let response = await info.json();
            // console.log(response);

            cardContainer.innerHTML = cardContainer.innerHTML +
                `<div data-folder="${folder}" class="card">
                <div class="play">
                    <img src="img/play.svg" alt="">
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
            playMusic(songs[0]); // Play the first song in the album
            adjustHighlightAndBrightness();
        });
    });
}


async function main() {

    // Get the list of all the songs
    // let songs = await getSongs("songs/rhymes");
    await getSongs("songs/rhymes"); // since songs in globar variable no need;
    playMusic(songs[0], true);

    // Displaying all the albums dynamically on the screen
    getAllAlbums();
    // Attaching event listeners for play-pause, next and previous.
    document.getElementById("playPause").addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            playPause.src = "img/pausebtn.svg";
            adjustHighlightAndBrightness();
        } else {
            currentSong.pause();
            playPause.src = "img/playbtn.svg";
        }
    });

    document.getElementById("next").addEventListener("click", () => {
        // console.log(currentSong.src.split("/songs/")[1]);
        // console.log(songs);
        let currentSongIndex = songs.indexOf(currentSong.src.split(`/${currFolder}/`)[1]);
        if (currentSongIndex === songs.length - 1) {
            playMusic(songs[0]);
        } else {
            playMusic(songs[currentSongIndex + 1]);
        }
        adjustHighlightAndBrightness();
    });

    document.getElementById("previous").addEventListener("click", () => {
        // console.log(currentSong.src);
        let currentSongIndex = songs.indexOf(currentSong.src.split(`/${currFolder}/`)[1]);
        if (currentSongIndex === 0) {
            playMusic(songs[songs.length - 1]);
        }
        else {
            playMusic(songs[currentSongIndex - 1]);
        }
        adjustHighlightAndBrightness();
    });

    // Listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        // Updating the displayed time
        let duration = currentSong.duration;
        let currentTime = currentSong.currentTime;
        // console.log(Math.floor(currentTime) + "," + Math.floor(duration));
        document.querySelector(".songTime").innerHTML = `${convertToMMSS(Math.floor(currentTime))} / ${convertToMMSS(Math.floor(duration))}`;

        // Updating the playbar and circle based on the same.
        let progressPercent = (currentTime / duration) * 100;
        document.querySelector(".progressBar").style.width = `${progressPercent}%`;
        document.querySelector(".circle").style.left = `${progressPercent}%`;
    });

    // Adding an event listener to the playbar & circle based on the same
    document.querySelector(".seekbar").addEventListener("click", (event) => {
        // console.log(event.target.getBoundingClientRect().width, event.offsetX);
        let seekbar = document.querySelector(".seekbar");
        let rect = seekbar.getBoundingClientRect();
        let offsetX = event.clientX - rect.left;
        let percent = (offsetX / rect.width) * 100;
        document.querySelector(".circle").style.left = `${percent}%`;
        document.querySelector(".progressBar").style.width = `${percent}%`;
        currentSong.currentTime = (percent / 100) * currentSong.duration;
    });

    // Adding an event listener for the Hamburger button
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });
    // Adding an event listener for the close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%";
    });

    // Adding an event listener for the volume slider
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (event) => {
        // console.log(event.target.value);
        currentSong.volume = (event.target.value) / 100;
        if(currentSong.volume === 0){
            vol.src = "img/mute.svg";
        }
        else{
            vol.src = "img/volume.svg";
        }
    });

    let defaultVolume = 1;
    document.getElementById("vol").addEventListener("click", e => {
        
        if(currentSong.volume !== 0)
        {
            defaultVolume = currentSong.volume;
            e.target.src = "img/mute.svg";
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else{
            e.target.src = "img/volume.svg";
            currentSong.volume = defaultVolume;
            document.querySelector(".range").getElementsByTagName("input")[0].value = defaultVolume*100;
        }
        
    });
    
}

main();
