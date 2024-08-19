import { closeAllWindows, resetVideoState } from './videoController.js';
import { formatTime } from './utils.js';

const videoPreviews = document.getElementById('video-previews');
const dropZone = document.getElementById('drop-zone');
const togglePlayBtn = document.getElementById('toggle-play');
const totalTimeDisplay = document.getElementById('total-time');
const timeLeftDisplay = document.getElementById('time-left');
const currentTimeDisplay = document.getElementById('current-time');
const progressBar = document.getElementById('progress-bar');

export function initializeUI() {
    updateToggleButton(false);
    resetTimeDisplay();
    videoPreviews.style.display = 'none';
}

export function updatePreviewWidths() {
    const videoCount = document.querySelectorAll('.video-preview').length;
    let width;
    if (videoCount === 1) width = '100%';
    else if (videoCount === 2) width = '50%';
    else if (videoCount === 3) width = '33.33%';
    else width = '25%';
    document.documentElement.style.setProperty('--preview-width', width);
}

export function updateToggleButton(isPlaying) {
    togglePlayBtn.textContent = isPlaying ? "Pause" : "Play";
}

export function updateTotalTime(duration) {
    totalTimeDisplay.textContent = formatTime(duration);
}

export function updateTimeDisplay(currentTime, duration) {
    currentTimeDisplay.textContent = formatTime(currentTime);
    timeLeftDisplay.textContent = formatTime(duration - currentTime);
    progressBar.value = Math.floor(currentTime);
}

export function resetTimeDisplay() {
    totalTimeDisplay.textContent = "00:00:00";
    timeLeftDisplay.textContent = "00:00:00";
    currentTimeDisplay.textContent = "00:00:00";
    progressBar.value = 0;
}

export function resetWithConfirmation() {
    if (confirm("Are you sure you want to reset? This will close all video windows and clear the current session.")) {
        console.log("Reset confirmed");
        closeAllWindows();
        resetVideoState();
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

export function addVideoPreview(file) {
    const previewContainer = document.createElement('div');
    previewContainer.className = 'video-preview';
    const video = document.createElement('video');
    video.src = URL.createObjectURL(file);
    video.muted = true;
    previewContainer.appendChild(video);
    videoPreviews.appendChild(previewContainer);
}