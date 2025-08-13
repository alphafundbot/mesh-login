/**
 * @fileoverview Configuration for the Revenue Pulse visualization.
 * Reflects strategist directives for clarity and control.
 */

interface VizConfigType {
    pulseGeometry: 'Quantum Bloom' | 'Waveform' | 'Node Graph' | 'Signal Stream';
    colorEncoding: 'Strategist Intent-based' | 'Yield-based' | 'Risk-based' | 'Source-based';
    streamCategorization: ('Automatic vs Manual' | 'ROI Tier' | 'Ritual Tag' | 'Platform Origin')[];
    interactivityMode: ('Click-to-Expand' | 'Voice Ritual' | 'Hover Reveal' | 'Gesture Overlay')[];
}

export const VizConfig: VizConfigType = {
    pulseGeometry: 'Quantum Bloom',
    colorEncoding: 'Strategist Intent-based',
    streamCategorization: ['Automatic vs Manual', 'ROI Tier', 'Ritual Tag'],
    interactivityMode: ['Click-to-Expand', 'Voice Ritual'],
};

// This configuration can be imported and used by visualization components
// to dynamically adjust their rendering based on strategist preferences.
/**
 * @fileoverview Configuration for the Revenue Pulse visualization.
 * Reflects strategist directives for clarity and control.
 */

interface VizConfigType {
    pulseGeometry: 'Quantum Bloom' | 'Standard Pulse' | 'Fractal';
    colorEncoding: 'Strategist Intent-based' | 'ROI-based' | 'Volume-based';
    streamCategorization: ('Automatic vs Manual' | 'ROI Tier' | 'Ritual Tag')[];
    interactivityMode: 'Click-to-Expand' | 'Voice Ritual' | 'Passive';
}

export const VizConfig: VizConfigType = {
    pulseGeometry: 'Quantum Bloom',
    colorEncoding: 'Strategist Intent-based',
    streamCategorization: ['Automatic vs Manual', 'ROI Tier', 'Ritual Tag'],
    interactivityMode: 'Click-to-Expand',
};

// This configuration can be imported and used by visualization components
// to dynamically adjust their rendering based on strategist preferences.
