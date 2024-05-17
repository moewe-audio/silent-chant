import { lastResult } from "../processor";
import { lastEstimate } from "../vowel-estimate";
import { FORMANTS, FormantFilter, mapVowelsToValue } from "./formants";
import { loadAndPlayMidi } from "./midi";

class ParameterSmoother {
    private alpha: number;
    private smoothedValue: number;

    constructor(initialValue: number, alpha: number) {
        this.alpha = alpha;
        this.smoothedValue = initialValue;
    }

    public update(currentValue: number): number {
        this.smoothedValue = this.alpha * currentValue + (1 - this.alpha) * this.smoothedValue;
        return this.smoothedValue;
    }

    public getValue(): number {
        return this.smoothedValue;
    }
}


let audioContext: AudioContext;
let voices: Map<number, Voice> = new Map();
let formantParameter: number = 0.0;
const smoothFormant = new ParameterSmoother(0, 0.11);
const smoothGain = new ParameterSmoother(0, 0.1);

export interface Voice {
    pulseOscillator: OscillatorNode,
    gainNode: GainNode,
    filters: BiquadFilterNode[]
}

export function initAudio() {
    audioContext = new window.AudioContext();
    setInterval(updateVoices, 30);
    loadAndPlayMidi(audioContext);
}

function updateVoices() {
    formantParameter = smoothFormant.update(lastEstimate.vowelParam);
    if (formantParameter > 1) formantParameter = 1;
    const formants: FormantFilter[] = mapVowelsToValue(formantParameter);
    voices.forEach(voice => {
        formants.forEach((formant, idx) => {
            voice.filters[idx].frequency.setValueAtTime(formant.freq, audioContext.currentTime);
            voice.filters[idx].Q.setValueAtTime(formant.freq / formant.bandwidth, audioContext.currentTime);
            voice.filters[idx].gain.setValueAtTime(formant.gain / formant.bandwidth, audioContext.currentTime);
        });
    })
    // setGainSmoothly(smoothGain.update(lastEstimate.activation * 1), 0.2);
}

export function createVoice(noteNumber: number, velocity: number) {
    const noteFrequency = midiToFrequency(noteNumber);
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

    voice.pulseOscillator.start();
    voice.gainNode.gain.setValueAtTime(velocity / 127, audioContext.currentTime);
    voice.gainNode.connect(audioContext.destination)
    voices.set(noteNumber, voice);
}

export function deleteVoice(noteNumber: number) {
    const voice = voices.get(noteNumber);
    if (voice) {
        voice.pulseOscillator.stop();
        voices.delete(noteNumber);
    }
}

function setGainSmoothly(targetGain: number, duration: number) {
    const currentTime = audioContext.currentTime;
    voices.forEach(voice => {
        const currentGain = voice.gainNode.gain.value;
        voice.gainNode.gain.cancelScheduledValues(currentTime);
        voice.gainNode.gain.setValueAtTime(currentGain, currentTime);
        voice.gainNode.gain.linearRampToValueAtTime(targetGain, currentTime + duration);
    });
}

function midiToFrequency(note: number): number {
    return 440 * Math.pow(2, (note - 69) / 12);
}