import { initializeUI, updatePreviewWidths } from './uiController.js';
import { addVideo, openAllVideos, togglePlay, masterWindow, setIsSeeking, getIsSeeking } from './videoController.js';
import { resetWithConfirmation } from './uiController.js';
import { syncSlaveVideos } from './syncController.js';

console.log("Script is running");

const dropZone = document.getElementById('drop-zone');
const openAllBtn = document.getElementById('open-all');
const togglePlayBtn = document.getElementById('toggle-play');
const resetBtn = document.getElementById('reset');
const progressBar = document.getElementById('progress-bar');

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
    console.log("Files dropped, total videos:", files.length);
});

openAllBtn.addEventListener('click', () => {
    console.log("Open all button clicked");
    openAllVideos();
});

togglePlayBtn.addEventListener('click', togglePlay);
resetBtn.addEventListener('click', resetWithConfirmation);

progressBar.addEventListener('input', () => {
    setIsSeeking(true);
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
    syncSlaveVideos();
    setIsSeeking(false);
});

initializeUI();

console.log("Script finished loading");