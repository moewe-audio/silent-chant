import { Midi } from '@tonejs/midi';
import { audioContext, faustNode } from './audio-processor';

type TransportState = 'STOPPED' | 'PAUSED' | 'PLAYING';
let transportState: TransportState = 'STOPPED';

export async function startPlayback(song: string) {
    if (transportState != 'STOPPED') {
        await audioContext.resume();
        return;
    }
    await audioContext.suspend();
    const [midi, backingAudio] = await Promise.all([
        loadMIDIFile('../midi/BillieJeanVocal.mid'),
        loadAudioFile('../midi/BillieJeanBackingTrack.wav', audioContext)
    ]);
    const now = audioContext.currentTime;
    playAudioBuffer(backingAudio, now, audioContext);
    playMIDIFile(audioContext, midi, now, 124);
    await audioContext.resume();
    transportState = 'PLAYING';
}

export async function stopPlayback() {
    await audioContext.suspend();
    transportState = 'PAUSED';
}

export async function loadMIDIFile(url: string) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return new Midi(arrayBuffer);
}

async function playMIDIFile(context: AudioContext, midi: Midi, time: number, bpm: number) {
    const originalBPM = 120;
    const timeFactor = originalBPM / bpm;

    midi.tracks.forEach(track => {
        track.notes.forEach(note => {
            const noteOnTime = time + note.time * timeFactor;
            const noteOffTime = noteOnTime + note.duration * timeFactor;
            const freqParam = faustNode.faustNode.parameters.get("/vocal/freq");
            const gainParam = faustNode.faustNode.parameters.get("/vocal/gain");        
            if (freqParam && gainParam) {
                freqParam.setValueAtTime(midiToFrequency(note.midi), noteOnTime);
                gainParam.setValueAtTime(0, noteOnTime);
                gainParam.setValueAtTime(note.velocity, noteOnTime + 0.05 * note.duration);
                gainParam.setValueAtTime(note.velocity, noteOffTime - 0.05 * note.duration);
                gainParam.linearRampToValueAtTime(0, noteOffTime);
            }
        });
    });
}

function midiToFrequency(note: number): number {
    return 440 * Math.pow(2, (note - 69) / 12);
}

async function loadAudioFile(url: string, audioContext: AudioContext): Promise<AudioBuffer> {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return await audioContext.decodeAudioData(arrayBuffer);
}

function playAudioBuffer(audioBuffer: AudioBuffer, startTime: number, audioContext: AudioContext) {
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.start(startTime);
}