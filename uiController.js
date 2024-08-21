import { closeAllWindows, resetVideoState } from './videoController.js';
import { formatTime } from './utils.js';

const dropZone = document.getElementById('drop-zone');
const togglePlayBtn = document.getElementById('toggle-play');
const totalTimeDisplay = document.getElementById('total-time');
const timeLeftDisplay = document.getElementById('time-left');
const currentTimeDisplay = document.getElementById('current-time');
const progressBar = document.getElementById('progress-bar');

export function initializeUI() {
    updateToggleButton(false);
    resetTimeDisplay();
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
    progressBar.max = Math.floor(duration);
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
        dropZone.style.display = 'block';
        dropZone.querySelector('p').textContent = 'Drop audio or video files here';
        resetTimeDisplay();
        return true;
    } else {
        console.log("Reset cancelled");
        return false;
    }
}

export function updateDropZone(hasFiles) {
    if (hasFiles) {
        dropZone.style.display = 'none';
    } else {
        dropZone.style.display = 'block';
        dropZone.querySelector('p').textContent = 'Drop audio or video files here';
    }
}

export function showError(message) {
    alert(message);
}