import { FaceMesh } from '@mediapipe/face_mesh';
import { Camera } from '@mediapipe/camera_utils';
import { drawLipModel } from './canvas-utils';
import { process, lastResult } from './processor';
import { init, updateUi } from './ui-utils';
import { estimateVowels } from './vowel-estimate'

const videoElement = document.getElementById('webcam') as HTMLVideoElement;
const canvasElement = document.getElementById(
    "output_canvas"
) as HTMLCanvasElement;
const canvasCtx = canvasElement.getContext("2d")!;

function onResults(results: any) {
    if (results.multiFaceLandmarks) {
        results.multiFaceLandmarks.forEach((landmarks: any) => {
            process(landmarks);
            estimateVowels(lastResult);
        });
    }
}

const faceMesh = new FaceMesh({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
});

faceMesh.setOptions({
    maxNumFaces: 1,
    refineLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});

faceMesh.onResults(onResults);

const camera = new Camera(videoElement, {
    onFrame: async () => {
        await faceMesh.send({ image: videoElement });
    },
    width: 640,
    height: 480
});

camera.start();
setTimeout(() => {
    init();
    setInterval(updateUi, 100);
    setInterval(() => drawLipModel(lastResult, canvasCtx, canvasElement), 30);
}, 2000);
