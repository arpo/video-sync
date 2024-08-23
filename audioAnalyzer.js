let audioContext;
let analyser;
let dataArray;
let isAnalyzing = false;

export const INITIAL_VALUES = {
    INTENSITY_THRESHOLD: 190,
    INTENSITY_THRESHOLD_MIN: 170,  // Add this line
    BASS_RANGE_START: 200,
    BASS_RANGE_END: 280,
    HARD_FLASH_THRESHOLD: 0.5,
    HUE: 200,
    SATURATION: 100
};

let INTENSITY_THRESHOLD = INITIAL_VALUES.INTENSITY_THRESHOLD;
let INTENSITY_THRESHOLD_MIN = INITIAL_VALUES.INTENSITY_THRESHOLD_MIN; 
let BASS_RANGE_START = INITIAL_VALUES.BASS_RANGE_START;
let BASS_RANGE_END = INITIAL_VALUES.BASS_RANGE_END;
let HARD_FLASH_THRESHOLD = INITIAL_VALUES.HARD_FLASH_THRESHOLD;
let HUE = INITIAL_VALUES.HUE;
let SATURATION = INITIAL_VALUES.SATURATION;

let isFlashEffectsEnabled = true;

export function setFlashEffectsEnabled(enabled) {
    isFlashEffectsEnabled = enabled;
    if (!enabled) {
        // Reset background when disabled
        document.body.style.backgroundColor = '#000000';
    }
}

export function setupAudioAnalyzer(audioElement) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaElementSource(audioElement);
    source.connect(analyser);
    analyser.connect(audioContext.destination);

    analyser.fftSize = 2048;
    dataArray = new Uint8Array(analyser.frequencyBinCount);

    isAnalyzing = true;
    analyzeBeat();
}

function analyzeBeat() {
    if (!isAnalyzing) return;

    analyser.getByteFrequencyData(dataArray);

    const startIndex = Math.floor(BASS_RANGE_START * analyser.fftSize / audioContext.sampleRate);
    const endIndex = Math.floor(BASS_RANGE_END * analyser.fftSize / audioContext.sampleRate);

    const bassSum = dataArray.slice(startIndex, endIndex).reduce((a, b) => a + b, 0);
    const bassAverage = bassSum / (endIndex - startIndex);

    if (bassAverage > INTENSITY_THRESHOLD) {
        // Adjust the normalization to account for the new minimum threshold
        let normalizedIntensity = (bassAverage - INTENSITY_THRESHOLD_MIN) / (255 - INTENSITY_THRESHOLD_MIN);
        normalizedIntensity = Math.min(Math.max(normalizedIntensity, 0), 1); // Ensure it's between 0 and 1
        
        if (normalizedIntensity > HARD_FLASH_THRESHOLD) {
            normalizedIntensity = 1;
        }
        
        flashBackground(normalizedIntensity);
    } else {
        resetBackground();
    }

    requestAnimationFrame(analyzeBeat);
}

let isStrobeActive = false;

export function setStrobeActive(active) {
    isStrobeActive = active;
}

function flashBackground(normalizedIntensity) {
    if (isFlashEffectsEnabled) {
        // Existing flash effect code
        const brightness = Math.floor(normalizedIntensity * 100);
        document.body.style.backgroundColor = `hsl(${HUE}, ${SATURATION}%, ${brightness}%)`;
    }
}


function resetBackground() {
    document.body.style.backgroundColor = '#070707';
}

export function stopAnalyzing() {
    isAnalyzing = false;
    if (audioContext) {
        audioContext.close();
    }
    resetBackground();
}

export function setIntensityThreshold(value) {
    INTENSITY_THRESHOLD = value;
}

export function setIntensityThresholdMin(value) {  // Add this function
    INTENSITY_THRESHOLD_MIN = value;
}

export function setBassRangeStart(value) {
    BASS_RANGE_START = value;
}

export function setBassRangeEnd(value) {
    BASS_RANGE_END = value;
}

export function setHardFlashThreshold(value) {
    HARD_FLASH_THRESHOLD = value;
}

export function setHue(value) {
    HUE = value;
}

export function setSaturation(value) {  // Add this function
    SATURATION = value;
}

export function getBassRangeFrequencies() {
    return {
        start: BASS_RANGE_START,
        end: BASS_RANGE_END
    };
}