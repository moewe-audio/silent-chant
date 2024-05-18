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
let voices: Map<string, Voice> = new Map();
let formantParameter: number = 0.0;
const smoothFormant = new ParameterSmoother(0, 0.05);
const smoothGain = new ParameterSmoother(0, 0.1);
const formantBuffer: number[] = [];
const formantBufferSize = 64;

export interface Voice {
    pulseOscillator: OscillatorNode,
    gainNode: GainNode,
    filters: BiquadFilterNode[],
    voiceType: number,
}

export function initAudio() {
    audioContext = new window.AudioContext();
    setInterval(updateVoices, 10);
    loadAndPlayMidi(audioContext);
}

function updateVoices() {
    formantParameter = smoothFormant.update(lastEstimate.vowelParam);
    if (formantParameter > 1) formantParameter = 1;
    formantBuffer.push(lastEstimate.vowelParam);
    if (formantBuffer.length == formantBufferSize) formantBuffer.shift();
    // voices.forEach(voice => {
    //     const formants: FormantFilter[] = mapVowelsToValue(formantParameter, voice.voiceType);
    //     formants.forEach((formant, idx) => {
    //         voice.filters[idx].frequency.setValueAtTime(formant.freq, audioContext.currentTime);
    //         voice.filters[idx].Q.setValueAtTime(formant.freq / formant.bandwidth, audioContext.currentTime);
    //         voice.filters[idx].gain.setValueAtTime(formant.gain / formant.bandwidth, audioContext.currentTime);
    //     });
    // })
    // setGainSmoothly(smoothGain.update(lastEstimate.activation * 1), 0.2);
}

export function createNote(noteNumber: number, velocity: number, noteDur: number, voiceNumber: number = 4, channelNo: number) {
    const noteFrequency = midiToFrequency(noteNumber);
    const voice: Voice = {
        pulseOscillator: audioContext.createOscillator(),
        gainNode: audioContext.createGain(),
        filters: [],
        voiceType: voiceNumber
    };
    voice.pulseOscillator.type = 'square';
    voice.pulseOscillator.frequency.setValueAtTime(noteFrequency, audioContext.currentTime);
    const formantsStart: FormantFilter[] = mapVowelsToValue(formantBuffer[0], voice.voiceType);
    const formantsEnd: FormantFilter[] = mapVowelsToValue(formantBuffer[formantBuffer.length - 1], voice.voiceType);
    formantsStart.forEach((startFormant, idx) => {
        const filter: BiquadFilterNode = audioContext.createBiquadFilter()
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(startFormant.freq, audioContext.currentTime);
        filter.Q.setValueAtTime(startFormant.freq / startFormant.bandwidth, audioContext.currentTime);
        filter.gain.setValueAtTime(startFormant.gain / startFormant.bandwidth, audioContext.currentTime);
        const endFormant = formantsEnd[idx];
        if (endFormant) {
            filter.frequency.linearRampToValueAtTime(endFormant.freq, audioContext.currentTime + noteDur);
            filter.Q.linearRampToValueAtTime(endFormant.freq / startFormant.bandwidth, audioContext.currentTime + noteDur);
            filter.gain.linearRampToValueAtTime(endFormant.gain / startFormant.bandwidth, audioContext.currentTime + noteDur);
        }
        filter.connect(voice.gainNode);
        voice.pulseOscillator.connect(filter);
        voice.filters.push(filter);
    });

    voice.pulseOscillator.start();
    voice.gainNode.gain.setValueAtTime(velocity / 127, audioContext.currentTime);
    voice.gainNode.gain.setValueAtTime(0, audioContext.currentTime + noteDur);
    voice.gainNode.connect(audioContext.destination)
    addVoice(channelNo, noteNumber, voice);
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


function createKey(channel: number, note: number): string {
    return `${channel}-${note}`;
}

function addVoice(channel: number, note: number, voice: Voice): void {
    const key = createKey(channel, note);
    voices.set(key, voice);
}

function getVoice(channel: number, note: number): Voice | undefined {
    const key = createKey(channel, note);
    return voices.get(key);
}

export function deleteVoice(channel: number, note: number): void {
    const key = createKey(channel, note);
    voices.delete(key);
}