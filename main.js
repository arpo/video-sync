import { syncSlaveVideos } from './syncController.js';
import { initializeUI, resetWithConfirmation, updatePreviewWidths } from './uiController.js';
import { addMedia, getDroppedFiles, masterAudio, openAllVideos, setIsSeeking, setOnFileAddedCallback, togglePlay, videoWindows } from './videoController.js';

console.log("Script is running");

const dropZone = document.getElementById('drop-zone');
const openAllBtn = document.getElementById('open-all');
const togglePlayBtn = document.getElementById('toggle-play');
const resetBtn = document.getElementById('reset');
const progressBar = document.getElementById('progress-bar');
const droppedFilesList = document.getElementById('dropped-files-list');

function updateFileList() {
    const files = getDroppedFiles();
    droppedFilesList.innerHTML = '';
    files.forEach((file, index) => {
        const li = document.createElement('li');
        li.textContent = `${index + 1}. ${file.name} (${file.type.startsWith('audio/') ? 'Audio' : 'Video'})`;
        droppedFilesList.appendChild(li);
    });
}

setOnFileAddedCallback(updateFileList);

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const files = Array.from(e.dataTransfer.files);
    files.forEach(file => {
        if (file.type.startsWith('audio/') || file.type.startsWith('video/')) {
            addMedia(file);
        }
    });
    updatePreviewWidths();
    console.log("Files dropped, total media:", files.length);
});

openAllBtn.addEventListener('click', () => {
    console.log("Open all media clicked");
    openAllVideos();
});

togglePlayBtn.addEventListener('click', togglePlay);
resetBtn.addEventListener('click', () => {
    resetWithConfirmation();
    updateFileList();
});

progressBar.addEventListener('input', () => {
    setIsSeeking(true);
});

progressBar.addEventListener('change', () => {
    const seekTime = progressBar.value;
    if (masterAudio) {
        masterAudio.currentTime = seekTime;
    } else if (videoWindows.length > 0) {
        videoWindows.forEach(win => {
            const video = win.document.querySelector('video');
            if (video) {
                video.currentTime = seekTime;
            }
        });
    }
    syncSlaveVideos();
    setIsSeeking(false);
});

initializeUI();
updateFileList();

console.log("Script finished loading");