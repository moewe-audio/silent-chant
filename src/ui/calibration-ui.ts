import { calibrating, startCalibration } from "../landmark-processing/calibration";

export function initCalibrationUi() {
    for (let i = 0; i < 5; i++) {
        const vowelCard = document.querySelector(`[data-vowel-id="${i}"]`) as HTMLElement;
        const captureButton = vowelCard.querySelector('#captureButton') as HTMLElement;
        captureButton.addEventListener('click', () => {
            onCaptureClick(i);
        })
    }
}

function onCaptureClick(vowelId: number) {
    if(calibrating) return;
    startCalibration(vowelId);
}