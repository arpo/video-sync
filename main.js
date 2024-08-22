import { initializeUI, updatePreviewWidths } from './uiController.js';
import { addMedia, openAllVideos, togglePlay, masterAudio, videoWindows, setIsSeeking, getIsSeeking, setOnFileAddedCallback, getDroppedFiles } from './videoController.js';
import { resetWithConfirmation } from './uiController.js';
import { syncSlaveVideos } from './syncController.js';
import { 
    setIntensityThreshold, 
    setIntensityThresholdMin,  // Add this line
    setBassRangeStart, 
    setBassRangeEnd, 
    setHardFlashThreshold, 
    setHue,
    setSaturation,
    getBassRangeFrequencies,
    INITIAL_VALUES
} from './audioAnalyzer.js';


const dropZone = document.getElementById('drop-zone');
const openAllBtn = document.getElementById('open-all');
const togglePlayBtn = document.getElementById('toggle-play');
const initBtn = document.getElementById('initBtn');
const progressBar = document.getElementById('progress-bar');
const droppedFilesList = document.getElementById('dropped-files-list');

const intensityThresholdInput = document.getElementById('intensity-threshold');
const intensityThresholdValue = document.getElementById('intensity-threshold-value');
const bassRangeStartInput = document.getElementById('bass-range-start');
const bassRangeStartValue = document.getElementById('bass-range-start-value');
const bassRangeEndInput = document.getElementById('bass-range-end');
const bassRangeEndValue = document.getElementById('bass-range-end-value');
const hardFlashThresholdInput = document.getElementById('hard-flash-threshold');
const hardFlashThresholdValue = document.getElementById('hard-flash-threshold-value');
const hueInput = document.getElementById('hue');
const hueValue = document.getElementById('hue-value');
const saturationInput = document.getElementById('saturation');
const saturationValue = document.getElementById('saturation-value');

function updateFrequencyDisplay() {
    const { start, end } = getBassRangeFrequencies();
    bassRangeStartValue.textContent = start.toFixed(2);
    bassRangeEndValue.textContent = end.toFixed(2);
}

function setInitialValues() {
    intensityThresholdInput.value = INITIAL_VALUES.INTENSITY_THRESHOLD;
    intensityThresholdInput.min = INITIAL_VALUES.INTENSITY_THRESHOLD_MIN;  // Add this line
    intensityThresholdValue.textContent = INITIAL_VALUES.INTENSITY_THRESHOLD;
    
    
    bassRangeStartInput.value = INITIAL_VALUES.BASS_RANGE_START;
    bassRangeEndInput.value = INITIAL_VALUES.BASS_RANGE_END;
    updateFrequencyDisplay();
    
    hardFlashThresholdInput.value = INITIAL_VALUES.HARD_FLASH_THRESHOLD;
    hardFlashThresholdValue.textContent = INITIAL_VALUES.HARD_FLASH_THRESHOLD;
    
    hueInput.value = INITIAL_VALUES.HUE;
    hueValue.textContent = INITIAL_VALUES.HUE;

    saturationInput.value = INITIAL_VALUES.SATURATION;
    saturationValue.textContent = INITIAL_VALUES.SATURATION;
}


intensityThresholdInput.addEventListener('input', (e) => {
    const value = e.target.value;
    setIntensityThreshold(Number(value));
    setIntensityThresholdMin(Number(intensityThresholdInput.min));  // Add this line
    intensityThresholdValue.textContent = value;
});

intensityThresholdInput.addEventListener('input', (e) => {
    const value = e.target.value;
    setIntensityThreshold(Number(value));
    intensityThresholdValue.textContent = value;
});

bassRangeStartInput.addEventListener('input', (e) => {
    const value = e.target.value;
    setBassRangeStart(Number(value));
    updateFrequencyDisplay();
});

bassRangeEndInput.addEventListener('input', (e) => {
    const value = e.target.value;
    setBassRangeEnd(Number(value));
    updateFrequencyDisplay();
});

hardFlashThresholdInput.addEventListener('input', (e) => {
    const value = e.target.value;
    setHardFlashThreshold(Number(value));
    hardFlashThresholdValue.textContent = value;
});

hueInput.addEventListener('input', (e) => {
    const value = e.target.value;
    setHue(Number(value));
    hueValue.textContent = value;
});

saturationInput.addEventListener('input', (e) => {
    const value = e.target.value;
    setSaturation(Number(value));
    saturationValue.textContent = value;
});

// Set initial values and update frequency display
setInitialValues();
updateFrequencyDisplay();

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

initBtn.addEventListener('click', () => {
    if (resetWithConfirmation()) {
        updateFileList();
        document.getElementById('video-previews').innerHTML = ''; // Clear preview videos
    }
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
    syncSlaveVideos(); // This will now also sync preview videos
    setIsSeeking(false);
});

window.addEventListener('resize', updatePreviewWidths);

initializeUI();
updateFileList();

console.log("Script finished loading");