import { masterWindow, videoWindows } from './videoController.js';

export function syncSlaveVideos() {
    if (!masterWindow || masterWindow.closed) {
        console.log("Master window is closed or not available.");
        return;
    }
    const masterVideo = masterWindow.document.querySelector('video');
    if (!masterVideo) {
        console.log("Master video element not found.");
        return;
    }
    videoWindows.forEach((win, index) => {
        if (index !== 0 && win && !win.closed) {
            const slaveVideo = win.document.querySelector('video');
            if (!slaveVideo) {
                console.log(`Slave video element not found in window ${index}.`);
                return;
            }
            if (Math.abs(slaveVideo.currentTime - masterVideo.currentTime) > 0.5) {
                slaveVideo.currentTime = Math.min(slaveVideo.duration, masterVideo.currentTime);
            }
            if (masterVideo.paused !== slaveVideo.paused) {
                masterVideo.paused ? slaveVideo.pause() : slaveVideo.play();
            }
        }
    });
    // Sync preview videos
    const previewVideos = document.querySelectorAll('#video-previews video');
    previewVideos.forEach(video => {
        if (Math.abs(video.currentTime - masterVideo.currentTime) > 0.5) {
            video.currentTime = Math.min(video.duration, masterVideo.currentTime);
        }
        if (masterVideo.paused !== video.paused) {
            masterVideo.paused ? video.pause() : video.play();
        }
    });
}

export function syncPlayState(isPlaying) {
    const previewVideos = document.querySelectorAll('#video-previews video');
    previewVideos.forEach(video => {
        if (isPlaying) {
            video.play();
        } else {
            video.pause();
        }
    });
}