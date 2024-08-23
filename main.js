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
    setFlashEffectsEnabled,
    setLowPassFrequency,
    setHighPassFrequency,
    INITIAL_VALUES
} from './audioAnalyzer.js';
import { initializeMIDI, setMIDIMessageCallback, mapMIDIValueToRange } from './midiController.js';

const config = {
    STROBE_DURATION: 1200
};

let scrollAnimationId;
let currentScrollSpeed = 0;
const MAX_SCROLL_SPEED = 40; // maximum pixels per frame
const MIN_FREQ = 20;
const MAX_FREQ = 22050;

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
const lowPassInput = document.getElementById('low-pass-filter');
const lowPassValue = document.getElementById('low-pass-value');
const highPassInput = document.getElementById('high-pass-filter');
const highPassValue = document.getElementById('high-pass-value');
const strobeButton = document.getElementById('strobe-button');
const strobeEffect = document.getElementById('strobe-effect');
let strobeTimeout;
let strobeInterval;
let strobeEndTime;

if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('/sw.js').then(function(registration) {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      }, function(err) {
        console.log('ServiceWorker registration failed: ', err);
      });
    });
  }

// MIDI mapping mad for Worlde Orca PAD48
function handleMIDIMessage(note, value) {
    // console.log(note, value);
    switch (note) {
        case 114:  // First Slider
            updateIntensityThreshold(value);
            break;
        case 18:  // Second Slider
            updateHardFlashThreshold(value);
            break;
        case 19:  // Third Slider
            updateHue(value);
            break;
        case 16:  // Fourth Slider
            updateSaturation(value);
            break;
        case 17:  // Fifth Slider
            break;
        case 91:  // Sixth Slider
            updateLowPassFilter(value);
            break;
        case 79:  // Seventh Slider
            updateHighPassFilter(value);
            break;
        case 72:  // Eighth Slider
            handleScrollSlider(value);
            break;
        case 44:  // button 1x1
            triggerStrobeEffect();
            break;
        case 45:  // button 1x2
            break;
        case 46:  // button 1x3
            break;
        case 47:  // button 1x4
            break;
        case 76:  // button 1x5
            break;
        case 77:  // button 1x6
            break;
        case 78:  // button 1x7
            break;
        case 79:  // button 1x8
            break;
    }
}

function logSliderToFreq(position) {
    // Ensure position is within valid range
    position = Math.max(0, Math.min(100, position));

    // Invert the position
    position = 100 - position;

    const minP = 0;
    const maxP = 100;

    // The result should be between MIN_FREQ and MAX_FREQ
    const minV = Math.log(MIN_FREQ);
    const maxV = Math.log(MAX_FREQ);

    // Calculate adjustment factor
    const scale = (maxV - minV) / (maxP - minP);

    return Math.exp(minV + scale * (position - minP));
}

function freqToLogSlider(freq) {
    // Ensure freq is within valid range
    freq = Math.max(MIN_FREQ, Math.min(MAX_FREQ, freq));

    const minP = 0;
    const maxP = 100;
    const minV = Math.log(MIN_FREQ);
    const maxV = Math.log(MAX_FREQ);

    // Calculate adjustment factor
    const scale = (maxV - minV) / (maxP - minP);

    // Invert the result
    return 100 - ((Math.log(freq) - minV) / scale + minP);
}


function updateLowPassFilter(value) {
    const mappedValue = logSliderToFreq(mapMIDIValueToRange(value, 0, 100));
    setLowPassFrequency(mappedValue);
    lowPassInput.value = freqToLogSlider(mappedValue);
    lowPassValue.textContent = Math.round(mappedValue);
}

function updateHighPassFilter(value) {
    const mappedValue = logSliderToFreq(mapMIDIValueToRange(value, 0, 100));
    setHighPassFrequency(mappedValue);
    highPassInput.value = freqToLogSlider(mappedValue);
    highPassValue.textContent = Math.round(mappedValue);
}

function handleScrollSlider(value) {
    // Map MIDI value to desired scroll speed
    const targetScrollSpeed = mapMIDIValueToRange(value, -MAX_SCROLL_SPEED, MAX_SCROLL_SPEED);
    
    // Start the smooth scrolling animation if it's not already running
    if (!scrollAnimationId) {
        smoothScroll();
    }
    
    // Update the current scroll speed (this will be used in the smoothScroll function)
    currentScrollSpeed = targetScrollSpeed;
}

function smoothScroll() {
    // Calculate the new scroll position
    if (Math.abs(currentScrollSpeed) > 0.1) {
        window.scrollBy(0, currentScrollSpeed);
    } else {
        currentScrollSpeed = 0; // Stop scrolling if speed is very low
    }

    // Continue the animation
    scrollAnimationId = requestAnimationFrame(smoothScroll);
}

// Add an event listener to stop scrolling when the user interacts with the page
window.addEventListener('wheel', stopScrolling);
window.addEventListener('touchstart', stopScrolling);

function stopScrolling() {
    if (scrollAnimationId) {
        cancelAnimationFrame(scrollAnimationId);
        scrollAnimationId = null;
    }
    currentScrollSpeed = 0;
}

const flashEffectsToggle = document.getElementById('flash-effects-toggle');
const toggleLabel = flashEffectsToggle.nextElementSibling;

flashEffectsToggle.addEventListener('change', (e) => {
    const isEnabled = e.target.checked;
    setFlashEffectsEnabled(isEnabled);
    toggleLabel.textContent = isEnabled ? 'ON' : 'OFF';
    
    // Optionally disable related controls when flash effects are off
    intensityThresholdInput.disabled = !isEnabled;
    hardFlashThresholdInput.disabled = !isEnabled;
    hueInput.disabled = !isEnabled;
    saturationInput.disabled = !isEnabled;
});

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
    const mappedValue = Math.round(mapMIDIValueToRange(value, 0, 100));
    setSaturation(mappedValue);
    saturationInput.value = mappedValue;
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

    // Set the actual values in the audio analyzer
    setIntensityThreshold(INITIAL_VALUES.INTENSITY_THRESHOLD);
    setIntensityThresholdMin(INITIAL_VALUES.INTENSITY_THRESHOLD_MIN);
    setHardFlashThreshold(INITIAL_VALUES.HARD_FLASH_THRESHOLD);
    setHue(INITIAL_VALUES.HUE);
    
    saturationInput.value = INITIAL_VALUES.SATURATION;
    saturationValue.textContent = INITIAL_VALUES.SATURATION;
    setSaturation(INITIAL_VALUES.SATURATION);

    const initialLowPassSliderValue = freqToLogSlider(INITIAL_VALUES.LOW_PASS_FREQUENCY);
    lowPassInput.value = initialLowPassSliderValue;
    lowPassValue.textContent = Math.round(INITIAL_VALUES.LOW_PASS_FREQUENCY);
    setLowPassFrequency(INITIAL_VALUES.LOW_PASS_FREQUENCY);

    const initialHighPassSliderValue = freqToLogSlider(INITIAL_VALUES.HIGH_PASS_FREQUENCY);
    highPassInput.value = initialHighPassSliderValue;
    highPassValue.textContent = Math.round(INITIAL_VALUES.HIGH_PASS_FREQUENCY);
    setHighPassFrequency(INITIAL_VALUES.HIGH_PASS_FREQUENCY);

    stopStrobeEffect();
}

lowPassInput.addEventListener('input', (e) => {
    const sliderValue = parseFloat(e.target.value);
    if (!isNaN(sliderValue)) {
        const frequencyValue = logSliderToFreq(sliderValue);
        setLowPassFrequency(frequencyValue);
        lowPassValue.textContent = Math.round(frequencyValue);
    }
});

highPassInput.addEventListener('input', (e) => {
    const sliderValue = parseFloat(e.target.value);
    if (!isNaN(sliderValue)) {
        const frequencyValue = logSliderToFreq(sliderValue);
        setHighPassFrequency(frequencyValue);
        highPassValue.textContent = Math.round(frequencyValue);
    }
});

const resetControlsBtn = document.getElementById('reset-controls');

strobeButton.addEventListener('click', triggerStrobeEffect);

function triggerStrobeEffect() {
    const currentTime = Date.now();
    
    if (strobeInterval) {
        // If strobe is active, extend the duration
        strobeEndTime = currentTime + config.STROBE_DURATION; // Extend by 1.5 seconds from now
        clearTimeout(strobeTimeout);
        setStrobeTimeout();
    } else {
        // Start a new strobe effect
        setStrobeActive(true);
        strobeEndTime = currentTime + config.STROBE_DURATION;
        
        // Start the strobe effect
        strobeInterval = setInterval(() => {
            strobeEffect.style.opacity = strobeEffect.style.opacity === '0' ? '1' : '0';
        }, 50); // 20 flashes per second
        
        setStrobeTimeout();
    }
}

function setStrobeTimeout() {
    strobeTimeout = setTimeout(() => {
        stopStrobeEffect();
    }, strobeEndTime - Date.now());
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
    strobeEndTime = null;
}

resetControlsBtn.addEventListener('click', () => {
    setInitialValues();
    stopStrobeEffect();
});

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