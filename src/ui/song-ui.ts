import { startPlayback, stopPlayback } from "../dsp/jukebox";

export function initSongUi() {
    const pauseButton = document.querySelector('#pauseButton') as HTMLElement;
    pauseButton.addEventListener('click', () => {
        onPauseClick();
    })
    const playButton = document.querySelector('#playButton') as HTMLElement;
    playButton.addEventListener('click', () => {
        onPlayClick();
    })
}

async function onPauseClick() {
    await stopPlayback();
}

async function onPlayClick() {
    await startPlayback('BillieJean');
}