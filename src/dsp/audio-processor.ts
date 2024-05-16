import { lastResult } from "../processor";
import { lastEstimate } from "../vowel-estimate";
import { FORMANTS, FormantFilter, mapVowelsToValue } from "./formants";

let audioContext: AudioContext;
let voices: Voice[] = [];
let formantParameter: number = 0.0;

interface Voice {
    pulseOscillator: OscillatorNode,
    gainNode: GainNode,
    filters: BiquadFilterNode[]
}

export function initAudio() {
    audioContext = new window.AudioContext();
    createVoice(70);
    setInterval(updateVoices, 20);
}

function updateVoices() {
    formantParameter = lastEstimate.vowelParam;
    if (formantParameter > 1 || formantParameter < 0) formantParameter = 0;
    const formants: FormantFilter[] = mapVowelsToValue(formantParameter);
    formants.forEach((formant, idx) => {
        voices[0].filters[idx].frequency.setValueAtTime(formant.freq, audioContext.currentTime);
        voices[0].filters[idx].Q.setValueAtTime(formant.freq / formant.bandwidth, audioContext.currentTime);
        voices[0].filters[idx].gain.setValueAtTime(formant.gain / formant.bandwidth, audioContext.currentTime);
    });
}

function createVoice(noteFrequency: number) {
    const voice: Voice = {
        pulseOscillator: audioContext.createOscillator(),
        gainNode: audioContext.createGain(),
        filters: []
    };
    voice.pulseOscillator.type = 'square'; 
    voice.pulseOscillator.frequency.setValueAtTime(noteFrequency, audioContext.currentTime);
    FORMANTS.u.forEach((formant, idx) => {
        const filter: BiquadFilterNode = audioContext.createBiquadFilter()
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(formant.freq, audioContext.currentTime);
        filter.Q.setValueAtTime(formant.freq / formant.bandwidth, audioContext.currentTime);
        filter.gain.setValueAtTime(formant.gain / formant.bandwidth, audioContext.currentTime);
        filter.connect(voice.gainNode);
        voice.pulseOscillator.connect(filter);
        voice.filters.push(filter);
    });
    
    voice.filters[voice.filters.length - 1].connect(audioContext.destination);
    voice.pulseOscillator.start();
    voice.gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
    voices.push(voice);
}

