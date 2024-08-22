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
    const previews = document.querySelectorAll('.video-preview');
    const previewsContainer = document.getElementById('video-previews');
    
    if (videoCount > 0) {
        const containerWidth = previewsContainer.offsetWidth;
        const gapSize = 10; // This should match the gap size in CSS
        const totalGapWidth = gapSize * (videoCount - 1);
        const availableWidth = containerWidth - totalGapWidth;
        const baseWidth = Math.floor(availableWidth / videoCount);

        previews.forEach((preview, index) => {
            let previewWidth;
            if (index === videoCount - 1) {
                // Last preview takes remaining width to account for potential rounding issues
                previewWidth = availableWidth - (baseWidth * (videoCount - 1));
            } else {
                previewWidth = baseWidth;
            }
            
            // Calculate height based on 16:9 aspect ratio
            const previewHeight = Math.floor(previewWidth * (9/16));
            
            preview.style.width = `${previewWidth}px`;
            preview.style.height = `${previewHeight}px`;
        });

        // Set the container height to match the preview height
        previewsContainer.style.height = `${previews[0].offsetHeight}px`;
    }
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
    if (confirm("Are you sure you want to init? This will close all video windows and clear the current session.")) {
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