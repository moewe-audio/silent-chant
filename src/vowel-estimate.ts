import { ProcessingResult, lastResult } from "./processor";
import { updateRangeIndicator } from "./ui-utils";

export let lastEstimate: number[] = [0, 0, 0, 0, 0]

interface Range {
    lower: number,
    upper: number
}

export interface EstimatorRange {
    openRange: Range,
    stretchRange: Range,
    circularityRatio: Range
}

export let RANGES: EstimatorRange[] = [
    {
        openRange: { lower: 0.2, upper: 2 },
        stretchRange: { lower: 1, upper: 1.3 },
        circularityRatio: { lower: 0.6, upper: 0.9 },
    },
    {
        openRange: { lower: 0.48, upper: 1.04 },
        stretchRange: { lower: 1.6, upper: 2 },
        circularityRatio: { lower: 0.56, upper: 0.78 },
    },
    {
        openRange: { lower: 0.44, upper: 0.9 },
        stretchRange: { lower: 1.4, upper: 2 },
        circularityRatio: { lower: 0.48, upper: 0.74 },
    },
    {
        openRange: { lower: 0.08, upper: 0.7 },
        stretchRange: { lower: 0.54, upper: 0.96 },
        circularityRatio: { lower: 0.68, upper: 1.12 },
    },
    {
        openRange: { lower: 0.02, upper: 0.46 },
        stretchRange: { lower: 0.58, upper: 0.86 },
        circularityRatio: { lower: 0.82, upper: 1.02 },
    }
];

function distToMiddle(value: number, range: Range): number {
    const middle = (range.upper + range.lower) / 2;
    const maxDist = (range.upper - range.lower) / 2;
    return Math.pow(Math.abs(value - middle) / maxDist, 4);
}

function inRange(value: number, range: Range): number {
    return Number(value >= range.lower && value <= range.upper);
}

function calculateScore(range: EstimatorRange, weights: { open: number, stretch: number, circularity: number }): number {

    let avg = 0;
    avg += inRange(lastResult.openessEstimate, range.openRange) ? weights.open * distToMiddle(lastResult.openessEstimate, range.openRange) : 1;
    avg += inRange(lastResult.stretch, range.stretchRange) ? weights.stretch * distToMiddle(lastResult.stretch, range.stretchRange) : 1;
    avg += inRange(lastResult.circularityRatio, range.circularityRatio) ? weights.circularity * distToMiddle(lastResult.circularityRatio, range.circularityRatio) : 1;

    const weightedAvg = avg / (weights.open + weights.stretch + weights.circularity);
    return 1 - weightedAvg;
}

export function estimateVowel(): number[] {
    const weights = { open: 0.6, stretch: 1, circularity: 1.6 };
    lastEstimate = RANGES.map(range => calculateScore(range, weights));
    return lastEstimate;
}

export function updateVowelRanges(vowelId: number, ranges: EstimatorRange) {
    RANGES[vowelId] = ranges;
    updateRangeIndicator('openValue', ranges.openRange.lower, ranges.openRange.upper, vowelId);
    updateRangeIndicator('stretchValue', ranges.stretchRange.lower, ranges.stretchRange.upper, vowelId);
    updateRangeIndicator('circularityRatio', ranges.circularityRatio.lower, ranges.circularityRatio.upper, vowelId);
}