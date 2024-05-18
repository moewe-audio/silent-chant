import { Midi } from '@tonejs/midi';
import { createNote, deleteVoice } from './audio-processor';

export async function loadMIDIFile(url: string) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return new Midi(arrayBuffer);
}

async function playMIDIFile(context: AudioContext, midiFileUrl: string) {    
    const midi = await loadMIDIFile(midiFileUrl);
    const now = context.currentTime;
    midi.tracks.forEach(track => {
        track.notes.forEach(note => {
            const noteOnTime = note.time;
            const noteOffTime = note.time + note.duration - (note.duration * 0.01);
            setTimeout(() => {
                createNote(note.midi, note.velocity, note.duration, 3, track.channel);
            }, (noteOnTime - now) * 1000);
            setTimeout(() => {
                deleteVoice(note.midi, track.channel);
            }, (noteOffTime - now) * 1000);
        });
    });
}

export function loadAndPlayMidi(context: AudioContext) {
    const midiFileUrl = '../midi/midi4Down.mid';
    setTimeout(async () => await playMIDIFile(context, midiFileUrl), 5000);
};