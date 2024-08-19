console.log("Script is running");

const dropZone = document.getElementById('drop-zone');
const videoPreviews = document.getElementById('video-previews');
const openAllBtn = document.getElementById('open-all');
const togglePlayBtn = document.getElementById('toggle-play');
const resetBtn = document.getElementById('reset');
const totalTimeDisplay = document.getElementById('total-time');
const timeLeftDisplay = document.getElementById('time-left');
const currentTimeDisplay = document.getElementById('current-time');
const progressBar = document.getElementById('progress-bar');
let droppedFiles = [];
let videoWindows = [];
let masterWindow = null;
let isPlaying = false;
let isSeeking = false;

console.log("All elements:", { dropZone, videoPreviews, openAllBtn, togglePlayBtn, resetBtn, totalTimeDisplay, timeLeftDisplay, currentTimeDisplay, progressBar });

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const files = Array.from(e.dataTransfer.files);
    files.forEach(file => {
        if (file.type.startsWith('video/')) {
            addVideo(file);
        }
    });
    updatePreviewWidths();
});

function addVideo(file) {
    console.log("Adding video:", file.name);
    droppedFiles.push(file);
    addVideoPreview(file);
}

function addVideoPreview(file) {
    const previewContainer = document.createElement('div');
    previewContainer.className = 'video-preview';
    const video = document.createElement('video');
    video.src = URL.createObjectURL(file);
    video.muted = true;
    previewContainer.appendChild(video);
    videoPreviews.appendChild(previewContainer);
}

function updatePreviewWidths() {
    const videoCount = droppedFiles.length;
    let width;
    if (videoCount === 1) {
        width = '100%';
    } else if (videoCount === 2) {
        width = '50%';
    } else if (videoCount === 3) {
        width = '33.33%';
    } else {
        width = '25%';
    }
    document.documentElement.style.setProperty('--preview-width', width);
}

function openVideo(file, index) {
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
                progressBar.max = Math.floor(video.duration);
                checkVideoLengths(video.duration);
            });
            video.addEventListener('timeupdate', () => {
                if (!isSeeking) {
                    syncSlaveVideos();
                    updateTimeDisplay(video.currentTime, video.duration);
                    progressBar.value = Math.floor(video.currentTime);
                }
            });
            video.addEventListener('play', () => {
                isPlaying = true;
                updateToggleButton();
                syncPlayState(true);
            });
            video.addEventListener('pause', () => {
                isPlaying = false;
                updateToggleButton();
                syncPlayState(false);
            });
            videoWindow.document.title = "Master Video: " + file.name;
        } else {
            video.muted = true;
            video.addEventListener('seeked', preventDesync);
            video.addEventListener('loadedmetadata', () => {
                checkVideoLengths(video.duration);
            });
            videoWindow.document.title = "Slave Video (Muted): " + file.name;
        }

        videoWindow.addEventListener('unload', () => {
            URL.revokeObjectURL(videoUrl);
            if (videoWindow === masterWindow) {
                masterWindow = null;
                isPlaying = false;
                updateToggleButton();
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

function checkVideoLengths(duration) {
    if (videoWindows.length > 1) {
        const masterDuration = videoWindows[0].document.querySelector('video').duration;
        const durationDiff = Math.abs(masterDuration - duration);
        if (durationDiff > 1) { // Allow 1 second difference to account for small variations
            console.warn(`Video length mismatch detected. Master: ${masterDuration}s, This video: ${duration}s`);
            alert(`Warning: A video with a different length has been detected. This may cause synchronization issues. Master: ${formatTime(masterDuration)}, This video: ${formatTime(duration)}`);
        }
    }
}

function syncSlaveVideos() {
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
    const previewVideos = videoPreviews.querySelectorAll('video');
    previewVideos.forEach(video => {
        if (Math.abs(video.currentTime - masterVideo.currentTime) > 0.5) {
            video.currentTime = Math.min(video.duration, masterVideo.currentTime);
        }
        if (masterVideo.paused !== video.paused) {
            masterVideo.paused ? video.pause() : video.play();
        }
    });
}

function syncPlayState(isPlaying) {
    const previewVideos = videoPreviews.querySelectorAll('video');
    previewVideos.forEach(video => {
        if (isPlaying) {
            video.play();
        } else {
            video.pause();
        }
    });
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

function closeAllWindows() {
    console.log("Closing all windows");
    videoWindows.forEach(win => {
        if (win && !win.closed) win.close();
    });
    videoWindows = [];
    masterWindow = null;
    isPlaying = false;
    updateToggleButton();
    resetTimeDisplay();
}

function togglePlay() {
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
        dropZone.style.display = 'none';
        videoPreviews.style.display = 'flex';
    }
}

function updateToggleButton() {
    togglePlayBtn.textContent = isPlaying ? "Pause" : "Play";
}

function formatTime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return [h, m, s].map(v => v < 10 ? "0" + v : v).join(":");
}

function updateTotalTime(duration) {
    totalTimeDisplay.textContent = formatTime(duration);
}

function updateTimeDisplay(currentTime, duration) {
    currentTimeDisplay.textContent = formatTime(currentTime);
    timeLeftDisplay.textContent = formatTime(duration - currentTime);
}

function resetTimeDisplay() {
    totalTimeDisplay.textContent = "00:00:00";
    timeLeftDisplay.textContent = "00:00:00";
    currentTimeDisplay.textContent = "00:00:00";
    progressBar.value = 0;
}

function resetWithConfirmation() {
    if (confirm("Are you sure you want to reset? This will close all video windows and clear the current session.")) {
        console.log("Reset confirmed");
        closeAllWindows();
        droppedFiles = [];
        videoPreviews.innerHTML = '';
        dropZone.style.display = 'block';
        videoPreviews.style.display = 'none';
        dropZone.querySelector('p').textContent = 'Drop video files here';
        updatePreviewWidths();
        resetTimeDisplay();
    } else {
        console.log("Reset cancelled");
    }
}

openAllBtn.addEventListener('click', () => {
    console.log("Open all button clicked");
    closeAllWindows();
    droppedFiles.forEach((file, index) => openVideo(file, index));
});

togglePlayBtn.addEventListener('click', togglePlay);

resetBtn.addEventListener('click', resetWithConfirmation);

progressBar.addEventListener('input', () => {
    isSeeking = true;
});

progressBar.addEventListener('change', () => {
    if (!masterWindow || masterWindow.closed) {
        console.log("Master window is not available. Cannot seek.");
        return;
    }
    const masterVideo = masterWindow.document.querySelector('video');
    if (!masterVideo) {
        console.log("Master video element not found.");
        return;
    }
    const seekTime = progressBar.value;
    masterVideo.currentTime = seekTime;
    updateTimeDisplay(seekTime, masterVideo.duration);
    syncSlaveVideos(); // Sync all videos after seeking
    isSeeking = false;
});

updateToggleButton();
resetTimeDisplay();
videoPreviews.style.display = 'none';

console.log("Script finished loading");