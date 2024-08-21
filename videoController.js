import { updateToggleButton, updateTotalTime, updateTimeDisplay, resetTimeDisplay } from './uiController.js';
import { syncSlaveVideos, syncPlayState } from './syncController.js';
import { checkVideoLengths } from './utils.js';

let droppedFiles = [];
let videoWindows = [];
let masterAudio = null;
let isPlaying = false;
let isSeeking = false;
let onFileAddedCallback = null;

export function getDroppedFiles() {
    return droppedFiles;
}

export function setOnFileAddedCallback(callback) {
    onFileAddedCallback = callback;
}

export function addMedia(file) {
    console.log("Adding media:", file.name);
    if (file.type.startsWith('audio/') && !masterAudio) {
        setupAudioMaster(file);
    } else if (file.type.startsWith('video/')) {
        droppedFiles.push(file);
    }
    if (onFileAddedCallback) {
        onFileAddedCallback(file);
    }
}

function setupAudioMaster(file) {
    masterAudio = document.createElement('audio');
    masterAudio.src = URL.createObjectURL(file);
    masterAudio.style.display = 'none';
    document.body.appendChild(masterAudio);

    masterAudio.addEventListener('loadedmetadata', () => {
        updateTotalTime(masterAudio.duration);
        document.getElementById('progress-bar').max = Math.floor(masterAudio.duration);
    });

    masterAudio.addEventListener('timeupdate', () => {
        if (!isSeeking) {
            syncSlaveVideos();
            updateTimeDisplay(masterAudio.currentTime, masterAudio.duration);
        }
    });

    masterAudio.addEventListener('play', () => {
        isPlaying = true;
        updateToggleButton(true);
        syncPlayState(true);
    });

    masterAudio.addEventListener('pause', () => {
        isPlaying = false;
        updateToggleButton(false);
        syncPlayState(false);
    });
}

export function openAllVideos() {
    console.log("Open all videos clicked");
    if (videoWindows.length > 0) {
        alert("Videos are already open. Please reset before opening new windows.");
        return;
    }
    droppedFiles.forEach((file, index) => openVideo(file, index));
}

export function openVideo(file, index) {
    console.log("Opening video:", file.name);
    const videoUrl = URL.createObjectURL(file);
    const videoWindow = window.open('/video.html', '_blank', 'width=640,height=480');
    if (!videoWindow) {
        console.error("Failed to open new window. Please check your popup blocker settings.");
        return;
    }
    videoWindow.addEventListener('load', () => {
        const video = videoWindow.document.querySelector('video');
        if (!video) {
            console.error("Video element not found in the new window.");
            return;
        }
        video.src = videoUrl;
        video.muted = true; // Mute all videos if there's a master audio

        video.addEventListener('loadedmetadata', () => {
            if (!masterAudio) {
                updateTotalTime(video.duration);
                document.getElementById('progress-bar').max = Math.floor(video.duration);
            }
            checkVideoLengths(video.duration);
        });

        videoWindow.addEventListener('unload', () => {
            URL.revokeObjectURL(videoUrl);
            const index = videoWindows.indexOf(videoWindow);
            if (index > -1) {
                videoWindows.splice(index, 1);
            }
        });
    });
    videoWindows.push(videoWindow);
}

export function closeAllWindows() {
    console.log("Closing all windows");
    videoWindows.forEach(win => {
        if (win && !win.closed) win.close();
    });
    videoWindows = [];
    if (masterAudio) {
        masterAudio.pause();
        masterAudio.remove();
        masterAudio = null;
    }
    isPlaying = false;
    updateToggleButton(false);
    resetTimeDisplay();
}

export function togglePlay() {
    if (masterAudio) {
        if (isPlaying) {
            masterAudio.pause();
        } else {
            masterAudio.play();
        }
    } else if (videoWindows.length > 0) {
        videoWindows.forEach(win => {
            const video = win.document.querySelector('video');
            if (video) {
                if (isPlaying) {
                    video.pause();
                } else {
                    video.play();
                }
            }
        });
    }
}

export function resetVideoState() {
    droppedFiles = [];
    videoWindows = [];
    if (masterAudio) {
        masterAudio.pause();
        masterAudio.remove();
        masterAudio = null;
    }
    isPlaying = false;
    isSeeking = false;
}

export function setIsSeeking(value) {
    isSeeking = value;
}

export function getIsSeeking() {
    return isSeeking;
}

export { masterAudio, videoWindows };