
export const MNEMOSYNE_VERSION = "2.0.0-BETA-HMM";

// Hertzian Space Constants
export const HERTZ_X_RANGE = [20, 20000]; // Auditory range
export const HERTZ_Y_STEP = 125;           // Phonetic resolution in ms
export const HERTZ_Z_MAX = 120;            // Max dB

// Affective Mapping Thresholds
export const RESONANCE_COHERENCE_LIMIT = 0.85;
export const STABILITY_RECALIBRATION_THRESHOLD = 0.15;

// Physics constants for Manifold
export const JITTER_DAMPENING = 0.98;
export const HARMONIC_FLICKER_RATE = 0.05;

export const DEFAULT_SONIC_CONFIG = {
    sampleRate: 48000,
    bitDepth: 24,
    manifoldDimension: 3
};
