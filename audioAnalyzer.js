let audioContext;
let analyser;
let dataArray;
let lowPassFilter;
let highPassFilter;
let isAnalyzing = false;

export const INITIAL_VALUES = {
    INTENSITY_THRESHOLD: 190,
    INTENSITY_THRESHOLD_MIN: 170,  // Add this line
    BASS_RANGE_START: 200,
    BASS_RANGE_END: 280,
    HARD_FLASH_THRESHOLD: 0.5,
    HUE: 200,
    SATURATION: 100,
    LOW_PASS_FREQUENCY: 22050,  // Default to Nyquist frequency (half of standard sample rate)
    HIGH_PASS_FREQUENCY: 0
};

let INTENSITY_THRESHOLD = INITIAL_VALUES.INTENSITY_THRESHOLD;
let INTENSITY_THRESHOLD_MIN = INITIAL_VALUES.INTENSITY_THRESHOLD_MIN; 
let BASS_RANGE_START = INITIAL_VALUES.BASS_RANGE_START;
let BASS_RANGE_END = INITIAL_VALUES.BASS_RANGE_END;
let HARD_FLASH_THRESHOLD = INITIAL_VALUES.HARD_FLASH_THRESHOLD;
let HUE = INITIAL_VALUES.HUE;
let SATURATION = INITIAL_VALUES.SATURATION;
let LOW_PASS_FREQUENCY = INITIAL_VALUES.LOW_PASS_FREQUENCY;
let HIGH_PASS_FREQUENCY = INITIAL_VALUES.HIGH_PASS_FREQUENCY;

let usbDevice = null;
let isFlashEffectsEnabled = true;

export function setFlashEffectsEnabled(enabled) {
    isFlashEffectsEnabled = enabled;
    if (!enabled) {
        // Reset background when disabled
        document.body.style.backgroundColor = '#000000';
        sendColorToUSBLight(0, 0, 0);
    }
}

export function setupAudioAnalyzer(mediaElement) {
    if (audioContext) {
        audioContext.close();
    }

    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();

    if (mediaElement instanceof HTMLVideoElement) {
        source = audioContext.createMediaElementSource(mediaElement);
    } else if (mediaElement instanceof HTMLAudioElement) {
        source = audioContext.createMediaElementSource(mediaElement);
    } else {
        console.error('Unsupported media element type');
        return;
    }

    source.connect(analyser);
    analyser.connect(audioContext.destination);

    analyser.fftSize = 2048;
    dataArray = new Uint8Array(analyser.frequencyBinCount);

    isAnalyzing = true;
    analyzeBeat();

    console.log("Audio analyzer setup completed successfully");
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

export function stopAnalyzing() {
    isAnalyzing = false;
    if (audioContext) {
        audioContext.close();
    }
    resetBackground();
}

export function setLowPassFrequency(value) {
    if (isFinite(value) && value >= 0) {
        LOW_PASS_FREQUENCY = value;
        if (lowPassFilter && audioContext) {
            lowPassFilter.frequency.setValueAtTime(value, audioContext.currentTime);
        }
    } else {
        console.warn(`Invalid low-pass frequency value: ${value}`);
    }
}

export function setHighPassFrequency(value) {
    if (isFinite(value) && value >= 0) {
        HIGH_PASS_FREQUENCY = value;
        if (highPassFilter && audioContext) {
            highPassFilter.frequency.setValueAtTime(value, audioContext.currentTime);
        }
    } else {
        console.warn(`Invalid high-pass frequency value: ${value}`);
    }
}

let isStrobeActive = false;

export function setStrobeActive(active) {
    isStrobeActive = active;
}

function flashBackground(normalizedIntensity) {
    if (isFlashEffectsEnabled) {
        const brightness = Math.floor(normalizedIntensity * 100);
        const rgb = hslToRgb(HUE / 360, SATURATION / 100, brightness / 100);
        document.body.style.backgroundColor = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        sendColorToUSBLight(rgb.r, rgb.g, rgb.b);
    }
}

export async function connectToUSBLight() {
    try {
        const device = await navigator.usb.requestDevice({
            filters: [{ vendorId: 0x27B8 }]  // Example vendorId for BlinkStick
        });
        await device.open();
        await device.selectConfiguration(1);
        await device.claimInterface(0);
        usbDevice = device;
        console.log('USB light connected');
    } catch (error) {
        // console.warn('Failed to connect to USB light:', error);
    }
}

async function sendColorToUSBLight(r, g, b) {
    if (!usbDevice) return;
    
    const data = new Uint8Array([0x00, r, g, b]);
    try {
        await usbDevice.transferOut(1, data);
    } catch (error) {
        console.error('Failed to send color to USB light:', error);
    }
}

function hslToRgb(h, s, l) {
    let r, g, b;

    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}

function resetBackground() {
    document.body.style.backgroundColor = '#070707';
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