import { masterAudio, videoWindows, syncPreviewVideos } from './videoController.js';

let syncOffset = 0;
const SYNC_THRESHOLD = 0.1; 

export function setSyncOffset(offset) {
    syncOffset = offset / 1000; // Convert ms to seconds
}


export function syncSlaveVideos() {
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
                // Include syncOffset in the condition check
                if (Math.abs((slaveVideo.currentTime - syncOffset) - masterTime) > SYNC_THRESHOLD) {
                    // Adjust the slave video time while maintaining the offset
                    slaveVideo.currentTime = masterTime + syncOffset;
                }

                if (isPlaying && slaveVideo.paused) {
                    slaveVideo.play().catch(e => console.error("Error playing video:", e));
                } else if (!isPlaying && !slaveVideo.paused) {
                    slaveVideo.pause();
                }
            }
        }
    });

    syncPreviewVideos(masterTime, isPlaying);
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