import { masterAudio, videoWindows, syncPreviewVideos } from './videoController.js';

let syncOffset = 0;
const SYNC_THRESHOLD = 0.5;
const THROTTLE_INTERVAL = 500;
let lastSyncTime = 0;

export function setSyncOffset(offset) {
    syncOffset = offset / 1000;
    console.log(`Sync offset set to ${syncOffset} seconds`);
}

function attemptPlay(video) {
    if (video.paused) {
        const playPromise = video.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                if (error.name === "AbortError") {
                    console.log("Play attempt was aborted, likely due to power saving.");
                } else {
                    console.error("Error playing video:", error);
                }
            });
        }
    }
}

export function syncSlaveVideos() {
    const now = Date.now();
    if (now - lastSyncTime < THROTTLE_INTERVAL) {
        return;
    }
    lastSyncTime = now;

    const masterTime = masterAudio ? masterAudio.currentTime : 
        (videoWindows[0] && videoWindows[0].document.querySelector('video')) ? 
        videoWindows[0].document.querySelector('video').currentTime : 0;

    const isPlaying = masterAudio ? !masterAudio.paused : 
        (videoWindows[0] && videoWindows[0].document.querySelector('video')) ? 
        !videoWindows[0].document.querySelector('video').paused : false;

    videoWindows.forEach((win, index) => {
        if (win && !win.closed) {
            const slaveVideo = win.document.querySelector('video');
            if (slaveVideo) {
                const timeDiff = Math.abs((slaveVideo.currentTime - syncOffset) - masterTime);
                if (timeDiff > SYNC_THRESHOLD) {
                    slaveVideo.currentTime = masterTime + syncOffset;
                }

                if (isPlaying && slaveVideo.paused) {
                    attemptPlay(slaveVideo);
                } else if (!isPlaying && !slaveVideo.paused) {
                    slaveVideo.pause();
                }
            }
        }
    });

    syncPreviewVideos(masterTime, isPlaying);
}

export function syncPlayState(isPlaying) {
    videoWindows.forEach((win, index) => {
        if (win && !win.closed) {
            const video = win.document.querySelector('video');
            if (video) {
                if (isPlaying) {
                    attemptPlay(video);
                } else {
                    video.pause();
                }
            }
        }
    });
}