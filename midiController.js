import { 
    setIntensityThreshold, 
    setHardFlashThreshold, 
    setHue,
    setSaturation
} from './audioAnalyzer.js';

let midiAccess = null;
let onMIDIMessageCallback = null;

export function initializeMIDI() {
    if (navigator.requestMIDIAccess) {
        navigator.requestMIDIAccess()
            .then(onMIDISuccess, onMIDIFailure);
    } else {
        console.log("Web MIDI API not supported in this browser.");
    }
}

function onMIDISuccess(access) {
    midiAccess = access;
    for (var input of midiAccess.inputs.values()) {
        input.onmidimessage = getMIDIMessage;
    }
    console.log("MIDI access successful");
}

function onMIDIFailure() {
    console.log("Failed to get MIDI access.");
}

function getMIDIMessage(message) {
    var command = message.data[0];
    var note = message.data[1];
    var velocity = (message.data.length > 2) ? message.data[2] : 0;

    // Call the callback function if it's set
    if (onMIDIMessageCallback) {
        onMIDIMessageCallback(note, velocity);
    }
}

export function setMIDIMessageCallback(callback) {
    onMIDIMessageCallback = callback;
}

export function mapMIDIValueToRange(value, min, max) {
    return min + (value / 127) * (max - min);
}