export function formatTime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return [h, m, s].map(v => v < 10 ? "0" + v : v).join(":");
}

export function checkVideoLengths(newDuration, masterDuration) {
    if (masterDuration !== undefined) {
        const durationDiff = Math.abs(masterDuration - newDuration);
        if (durationDiff > 1) { // Allow 1 second difference to account for small variations
            console.warn(`Video length mismatch detected. Master: ${masterDuration}s, This video: ${newDuration}s`);
            alert(`Warning: A video with a different length has been detected. This may cause synchronization issues. Master: ${formatTime(masterDuration)}, This video: ${formatTime(newDuration)}`);
        }
    }
}