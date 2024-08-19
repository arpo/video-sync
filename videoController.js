import { updateToggleButton, updateTotalTime, updateTimeDisplay, resetTimeDisplay, addVideoPreview } from './uiController.js';
import { syncSlaveVideos, syncPlayState } from './syncController.js';
import { checkVideoLengths } from './utils.js';

let droppedFiles = [];
let videoWindows = [];
let masterWindow = null;
let isPlaying = false;
let isSeeking = false;

export function getDroppedFiles() {
    return droppedFiles;
}

export function setIsSeeking(value) {
    isSeeking = value;
}

export function getIsSeeking() {
    return isSeeking;
}

export function addVideo(file) {
    console.log("Adding video:", file.name);
    droppedFiles.push(file);
    addVideoPreview(file);
}

export function openAllVideos() {
    console.log("Open all button clicked");
    closeAllWindows();
    console.log("Number of dropped files:", droppedFiles.length);
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
        
        if (index === 0) {
            masterWindow = videoWindow;
            video.addEventListener('loadedmetadata', () => {
                updateTotalTime(video.duration);
                document.getElementById('progress-bar').max = Math.floor(video.duration);
                checkVideoLengths(video.duration);
            });
            video.addEventListener('timeupdate', () => {
                if (!isSeeking) {
                    syncSlaveVideos();
                    updateTimeDisplay(video.currentTime, video.duration);
                }
            });
            video.addEventListener('play', () => {
                isPlaying = true;
                updateToggleButton(true);
                syncPlayState(true);
            });
            video.addEventListener('pause', () => {
                isPlaying = false;
                updateToggleButton(false);
                syncPlayState(false);
            });
            videoWindow.document.title = "Master Video: " + file.name;
        } else {
            video.muted = true;
            video.addEventListener('seeked', preventDesync);
            video.addEventListener('loadedmetadata', () => {
                const masterDuration = masterWindow ? masterWindow.document.querySelector('video').duration : undefined;
                checkVideoLengths(video.duration, masterDuration);
            });
            videoWindow.document.title = "Slave Video (Muted): " + file.name;
        }

        videoWindow.addEventListener('unload', () => {
            URL.revokeObjectURL(videoUrl);
            if (videoWindow === masterWindow) {
                masterWindow = null;
                isPlaying = false;
                updateToggleButton(false);
                resetTimeDisplay();
            }
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
    masterWindow = null;
    isPlaying = false;
    updateToggleButton(false);
    resetTimeDisplay();
}

export function togglePlay() {
    if (!masterWindow || masterWindow.closed) {
        console.log("Master window is not available. Cannot toggle playback.");
        return;
    }
    const masterVideo = masterWindow.document.querySelector('video');
    if (!masterVideo) {
        console.log("Master video element not found.");
        return;
    }
    if (isPlaying) {
        masterVideo.pause();
    } else {
        masterVideo.play();
        document.getElementById('drop-zone').style.display = 'none';
        document.getElementById('video-previews').style.display = 'flex';
    }
}

function preventDesync(event) {
    if (!masterWindow || masterWindow.closed) {
        console.log("Master window is closed or not available.");
        return;
    }
    const masterVideo = masterWindow.document.querySelector('video');
    if (!masterVideo) {
        console.log("Master video element not found.");
        return;
    }
    const slaveVideo = event.target;
    if (Math.abs(slaveVideo.currentTime - masterVideo.currentTime) > 0.5) {
        slaveVideo.currentTime = Math.min(slaveVideo.duration, masterVideo.currentTime);
    }
}

export function resetVideoState() {
    droppedFiles = [];
    videoWindows = [];
    masterWindow = null;
    isPlaying = false;
    isSeeking = false;
}

export { masterWindow, videoWindows };