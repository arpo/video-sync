import { initializeUI, updatePreviewWidths } from './uiController.js';
import { addMedia, openAllVideos, togglePlay, masterAudio, videoWindows, setIsSeeking, getIsSeeking, setOnFileAddedCallback, getDroppedFiles } from './videoController.js';
import { resetWithConfirmation } from './uiController.js';
import { syncSlaveVideos } from './syncController.js';
import { 
    setIntensityThreshold, 
    setIntensityThresholdMin,  
    setBassRangeStart, 
    setBassRangeEnd, 
    setHardFlashThreshold, 
    setHue,
    setSaturation,
    getBassRangeFrequencies,
    setStrobeActive,
    INITIAL_VALUES
} from './audioAnalyzer.js';
import { initializeMIDI, setMIDIMessageCallback, mapMIDIValueToRange } from './midiController.js';


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
const saturationToggle = document.getElementById('saturation-toggle');
const saturationValue = document.getElementById('saturation-value');
const strobeButton = document.getElementById('strobe-button');
const strobeEffect = document.getElementById('strobe-effect');

let strobeTimeout;
let strobeInterval;
function handleMIDIMessage(note, value) {
    switch (note) {
        case 13:  // First knob
            updateIntensityThreshold(value);
            break;
        case 3:  // Second knob
            updateHardFlashThreshold(value);
            break;
        case 2:  // Third knob
            updateHue(value);
            break;
        case 1:  // Fourth knob
            // updateStrobeIntensity(value);
            break;
    }
}

function updateIntensityThreshold(value) {
    const mappedValue = mapMIDIValueToRange(value, 170, 255);
    setIntensityThreshold(mappedValue);
    intensityThresholdInput.value = mappedValue;
    intensityThresholdValue.textContent = Math.round(mappedValue);
}

function updateHardFlashThreshold(value) {
    const mappedValue = mapMIDIValueToRange(value, 0, 1);
    setHardFlashThreshold(mappedValue);
    hardFlashThresholdInput.value = mappedValue;
    hardFlashThresholdValue.textContent = mappedValue.toFixed(2);
}

function updateHue(value) {
    const mappedValue = mapMIDIValueToRange(value, 0, 360);
    setHue(mappedValue);
    hueInput.value = mappedValue;
    hueValue.textContent = Math.round(mappedValue);
}

function updateSaturation(value) {
    const mappedValue = value > 63 ? 100 : 0;  // Threshold at midpoint of MIDI range
    setSaturation(mappedValue);
    saturationToggle.checked = mappedValue === 100;
    saturationValue.textContent = mappedValue;
}

// Initialize MIDI and set up the callback
initializeMIDI();
setMIDIMessageCallback(handleMIDIMessage);

function updateFrequencyDisplay() {
    const { start, end } = getBassRangeFrequencies();
    bassRangeStartValue.textContent = start.toFixed(2);
    bassRangeEndValue.textContent = end.toFixed(2);
}

function setInitialValues() {
    intensityThresholdInput.value = INITIAL_VALUES.INTENSITY_THRESHOLD;
    intensityThresholdInput.min = INITIAL_VALUES.INTENSITY_THRESHOLD_MIN;
    intensityThresholdValue.textContent = INITIAL_VALUES.INTENSITY_THRESHOLD;
    
    hardFlashThresholdInput.value = INITIAL_VALUES.HARD_FLASH_THRESHOLD;
    hardFlashThresholdValue.textContent = INITIAL_VALUES.HARD_FLASH_THRESHOLD;
    
    hueInput.value = INITIAL_VALUES.HUE;
    hueValue.textContent = INITIAL_VALUES.HUE;

    // saturationInput.value = INITIAL_VALUES.SATURATION;
    // saturationValue.textContent = INITIAL_VALUES.SATURATION;

    // Set the actual values in the audio analyzer
    setIntensityThreshold(INITIAL_VALUES.INTENSITY_THRESHOLD);
    setIntensityThresholdMin(INITIAL_VALUES.INTENSITY_THRESHOLD_MIN);
    setHardFlashThreshold(INITIAL_VALUES.HARD_FLASH_THRESHOLD);
    setHue(INITIAL_VALUES.HUE);
    
    saturationToggle.checked = INITIAL_VALUES.SATURATION === 100;
    saturationValue.textContent = INITIAL_VALUES.SATURATION;
    setSaturation(INITIAL_VALUES.SATURATION);

    stopStrobeEffect();
}

const resetControlsBtn = document.getElementById('reset-controls');

strobeButton.addEventListener('click', triggerStrobeEffect);

function triggerStrobeEffect() {
    if (strobeInterval || strobeTimeout) {
        return; // Prevent multiple triggers
    }
    
    setStrobeActive(true);
    strobeButton.disabled = true;
    
    // Start the strobe effect
    strobeInterval = setInterval(() => {
        strobeEffect.style.opacity = strobeEffect.style.opacity === '0' ? '1' : '0';
    }, 50); // 20 flashes per second
    
    // Stop the effect after 2 seconds
    strobeTimeout = setTimeout(() => {
        stopStrobeEffect();
        strobeButton.disabled = false;
    }, 1500);
}

function stopStrobeEffect() {
    if (strobeInterval) {
        clearInterval(strobeInterval);
        strobeInterval = null;
    }
    if (strobeTimeout) {
        clearTimeout(strobeTimeout);
        strobeTimeout = null;
    }
    setStrobeActive(false);
    strobeEffect.style.opacity = '0';
}

resetControlsBtn.addEventListener('click', () => {
    setInitialValues();
    stopStrobeEffect();
});

saturationToggle.addEventListener('change', (e) => {
    const value = e.target.checked ? 100 : 0;
    setSaturation(value);
    saturationValue.textContent = value;
})

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

// saturationInput.addEventListener('input', (e) => {
//     const value = e.target.value;
//     setSaturation(Number(value));
//     saturationValue.textContent = value;
// });

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