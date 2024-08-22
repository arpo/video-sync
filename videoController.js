import { updateToggleButton, updateTotalTime, updateTimeDisplay, resetTimeDisplay, updatePreviewWidths, updateDropZone } from './uiController.js';
import { syncSlaveVideos, syncPlayState } from './syncController.js';
import { checkVideoLengths } from './utils.js';
import { setupAudioAnalyzer, stopAnalyzing } from './audioAnalyzer.js';

let previewVideos = [];
let droppedFiles = [];
let videoWindows = [];
let masterAudio = null;
let masterVideo = null;
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
    if (file.type.startsWith('audio/')) {
        if (!masterAudio) {
            setupAudioMaster(file);
        }
        droppedFiles.unshift(file);
    } else if (file.type.startsWith('video/')) {
        droppedFiles.push(file);
        createVideoPreview(file);
    }
    if (onFileAddedCallback) {
        onFileAddedCallback(file);
    }
}

function createVideoPreview(file) {
    const previewContainer = document.createElement('div');
    previewContainer.className = 'video-preview';
    const video = document.createElement('video');
    video.src = URL.createObjectURL(file);
    video.muted = true;
    video.loop = false; // Add this line to make the preview loop
    previewContainer.appendChild(video);
    document.getElementById('video-previews').appendChild(previewContainer);
    previewVideos.push(video);
    updatePreviewWidths();
}

export function syncPreviewVideos() {
    const masterMedia = masterAudio || masterVideo;
    if (!masterMedia) return;

    const currentTime = masterMedia.currentTime;
    const isPlaying = !masterMedia.paused;

    previewVideos.forEach(video => {
        if (Math.abs(video.currentTime - currentTime) > 0.1) {
            video.currentTime = currentTime;
        }
        if (isPlaying && video.paused) {
            video.play().catch(e => console.log("Preview play prevented:", e));
        } else if (!isPlaying && !video.paused) {
            video.pause();
        }
    });
}

function setupAudioMaster(file) {
    masterAudio = document.createElement('audio');
    masterAudio.src = URL.createObjectURL(file);
    masterAudio.style.display = 'none';
    document.body.appendChild(masterAudio);

    masterAudio.addEventListener('loadedmetadata', () => {
        updateTotalTime(masterAudio.duration);
        document.getElementById('progress-bar').max = Math.floor(masterAudio.duration);
        setupAudioAnalyzer(masterAudio);
    });

    masterAudio.addEventListener('timeupdate', () => {
        if (!isSeeking && masterAudio) {
            syncSlaveVideos();
            syncPreviewVideos(); // Add this line
            updateTimeDisplay(masterAudio.currentTime, masterAudio.duration);
        }
    });

    masterAudio.addEventListener('play', () => {
        isPlaying = true;
        updateToggleButton(true);
        syncPlayState(true);
        syncPreviewVideos(); // Add this line
    });

    masterAudio.addEventListener('pause', () => {
        isPlaying = false;
        updateToggleButton(false);
        syncPlayState(false);
        syncPreviewVideos(); // Add this line
    });
}

export function openAllVideos() {
    console.log("Open all videos clicked");
    if (videoWindows.length > 0) {
        alert("Videos are already open. Please reset before opening new windows.");
        return;
    }
    droppedFiles.forEach((file, index) => {
        if (file.type.startsWith('video/')) {
            openVideo(file, index);
        }
    });
    updateDropZone(true); // Hide the drop zone
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
        
        if (!masterAudio && !masterVideo) {
            // This is the first video and there's no audio master, so make it the master
            masterVideo = video;
            video.muted = false;
            videoWindow.document.title = "Master Video: " + file.name;
            
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
        } else {
            // This is a slave video, mute it
            video.muted = true;
            videoWindow.document.title = "Slave Video (Muted): " + file.name;
        }

        video.addEventListener('seeked', preventDesync);

        videoWindow.addEventListener('unload', () => {
            URL.revokeObjectURL(videoUrl);
            const index = videoWindows.indexOf(videoWindow);
            if (index > -1) {
                videoWindows.splice(index, 1);
            }
            if (video === masterVideo) {
                masterVideo = null;
                // If there are other videos, make the first one the new master
                if (videoWindows.length > 0) {
                    const newMasterWindow = videoWindows[0];
                    const newMasterVideo = newMasterWindow.document.querySelector('video');
                    if (newMasterVideo) {
                        masterVideo = newMasterVideo;
                        newMasterVideo.muted = false;
                        newMasterWindow.document.title = "Master Video: " + droppedFiles[videoWindows.indexOf(newMasterWindow)].name;
                    }
                }
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
    masterVideo = null;
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
    } else if (masterVideo) {
        if (isPlaying) {
            masterVideo.pause();
        } else {
            masterVideo.play();
        }
    }
}

function preventDesync(event) {
    const targetVideo = event.target;
    const masterMedia = masterAudio || masterVideo;
    if (masterMedia && Math.abs(targetVideo.currentTime - masterMedia.currentTime) > 0.5) {
        targetVideo.currentTime = masterMedia.currentTime;
    }
}

export function resetVideoState() {
    droppedFiles = [];
    videoWindows = [];
    previewVideos = [];
    if (masterAudio) {
        masterAudio.pause();
        masterAudio.remove();
        masterAudio = null;
    }
    masterVideo = null;
    isPlaying = false;
    isSeeking = false;
    document.getElementById('video-previews').innerHTML = '';
}


export function setIsSeeking(value) {
    isSeeking = value;
    if (!value) {
        syncPreviewVideos(); // Add this line
    }
}

export function getIsSeeking() {
    return isSeeking;
}

export { masterAudio, masterVideo, videoWindows };
