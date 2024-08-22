let audioContext;
let analyser;
let dataArray;
let isAnalyzing = false;

export const INITIAL_VALUES = {
    INTENSITY_THRESHOLD: 190,
    BASS_RANGE_START: 200,
    BASS_RANGE_END: 280,
    HARD_FLASH_THRESHOLD: 0.5,
    HUE: 200
};

let INTENSITY_THRESHOLD = INITIAL_VALUES.INTENSITY_THRESHOLD;
let BASS_RANGE_START = INITIAL_VALUES.BASS_RANGE_START;
let BASS_RANGE_END = INITIAL_VALUES.BASS_RANGE_END;
let HARD_FLASH_THRESHOLD = INITIAL_VALUES.HARD_FLASH_THRESHOLD;
let HUE = INITIAL_VALUES.HUE;

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
        let normalizedIntensity = (bassAverage - INTENSITY_THRESHOLD) / (255 - INTENSITY_THRESHOLD);
        
        if (normalizedIntensity > HARD_FLASH_THRESHOLD) {
            normalizedIntensity = 1;
        }
        
        flashBackground(normalizedIntensity);
    } else {
        resetBackground();
    }

    requestAnimationFrame(analyzeBeat);
}

function flashBackground(normalizedIntensity) {
    const brightness = Math.floor(normalizedIntensity * 100);
    document.body.style.backgroundColor = `hsl(${HUE}, 100%, ${brightness}%)`;
}

function resetBackground() {
    document.body.style.backgroundColor = '#000000';
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

export function getBassRangeFrequencies() {
    return {
        start: BASS_RANGE_START,
        end: BASS_RANGE_END
    };
}