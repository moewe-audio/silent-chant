import { ProcessingResult, lastResult } from "./processor";
import { EstimatorRange, updateVowelRanges } from "./vowel-estimate";

export const BUFFER_SIZE = 100;
export let calibrating = false;
export let resultSamples: ProcessingResult[] = [];
let intervalId;
let vowelId = 0;

export function startCalibration(id: number) {
    calibrating = true;
    intervalId = setInterval(sampleResult, 30);
    vowelId = id;
}

function calculateEstimateRanges() {
    const openValues = resultSamples.map(r => r.openessEstimate);
    const widthValues = resultSamples.map(r => r.width);
    const lipThicknessValues = resultSamples.map(r => r.lipThickness);
    const [devOpen, avgOpen] = trimmedStandardDeviation(openValues, 0.1);
    const [devWidth, avgWidth] = trimmedStandardDeviation(widthValues, 0.1);
    const [devLipThickness, avgLipThickness] = trimmedStandardDeviation(lipThicknessValues, 0.1);
    updateVowelRanges(vowelId, {
        openRange: {
            lower: avgOpen - devOpen,
            upper: avgOpen + devOpen
        },
        stretchRange: {
            lower: avgWidth - devWidth,
            upper: avgWidth + devWidth
        },
        lipThicknessRange: {
            lower: avgLipThickness - devLipThickness,
            upper: avgLipThickness + devLipThickness
        },
    })
}

function stopRecording() {
    clearInterval(intervalId!);
    calibrating = false;
    calculateEstimateRanges();
    resultSamples = [];
}

function sampleResult() {
    resultSamples.push(lastResult);
    if (resultSamples.length == BUFFER_SIZE) stopRecording();
}

function trimmedStandardDeviation(data: number[], trimPercentage: number): [number, number] {
    const sortedData = data.sort((a, b) => a - b);
    const trimCount = Math.floor(data.length * trimPercentage / 2);
    const trimmedData = sortedData.slice(trimCount, sortedData.length - trimCount);
    const mean = trimmedData.reduce((acc, val) => acc + val, 0) / trimmedData.length;
    const sumOfSquares = trimmedData.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0);
    const variance = sumOfSquares / trimmedData.length;
    const trimmedStdDev = Math.sqrt(variance);
    return [trimmedStdDev, mean];
}