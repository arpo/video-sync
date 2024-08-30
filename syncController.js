import { masterAudio, videoWindows, syncPreviewVideos } from './videoController.js';

let syncOffset = 0;
const SYNC_THRESHOLD = 0.1; // Reduced threshold for tighter sync
const THROTTLE_INTERVAL = 250; // Reduced interval for more frequent checks
let lastSyncTime = 0;

export function setSyncOffset(offset) {
    syncOffset = offset / 1000; // Convert ms to seconds
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
                const targetTime = masterTime + syncOffset;
                const currentDiff = Math.abs(slaveVideo.currentTime - targetTime);

                if (currentDiff > SYNC_THRESHOLD) {
                    slaveVideo.currentTime = targetTime;
                    console.log(`Adjusted slave ${index}. Current: ${slaveVideo.currentTime.toFixed(2)}, Target: ${targetTime.toFixed(2)}, Diff: ${currentDiff.toFixed(2)}`);
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