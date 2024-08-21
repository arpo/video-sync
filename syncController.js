import { masterAudio, videoWindows } from './videoController.js';

export function syncSlaveVideos() {
    const masterTime = masterAudio ? masterAudio.currentTime : 
        (videoWindows[0] && videoWindows[0].document.querySelector('video')) ? 
        videoWindows[0].document.querySelector('video').currentTime : 0;

    videoWindows.forEach((win, index) => {
        if (win && !win.closed) {
            const slaveVideo = win.document.querySelector('video');
            if (slaveVideo) {
                if (Math.abs(slaveVideo.currentTime - masterTime) > 0.5) {
                    slaveVideo.currentTime = masterTime;
                }
                if (masterAudio) {
                    masterAudio.paused ? slaveVideo.pause() : slaveVideo.play();
                }
            }
        }
    });
}

export function syncPlayState(isPlaying) {
    videoWindows.forEach(win => {
        if (win && !win.closed) {
            const video = win.document.querySelector('video');
            if (video) {
                isPlaying ? video.play() : video.pause();
            }
        }
    });
}