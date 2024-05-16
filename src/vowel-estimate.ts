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
        openRange: {
            lower: 0.007612340872885315,
            upper: 1.442159134537703
        },
        stretchRange: {
            lower: 1.18918584896638,
            upper: 1.3798802333625222
        },
        circularityRatio: {
            lower: -0.8272599149026139,
            upper: 5.927510534496865
        }
    },
    {
        openRange: {
            lower: -0.03936391388901861,
            upper: 1.2159750353091776
        },
        stretchRange: {
            lower: 1.1531355130296372,
            upper: 2.1402597318258008
        },
        circularityRatio: {
            lower: -0.1959848158896551,
            upper: 1.3813795177297885
        }
    },
    {
        openRange: {
            lower: -0.1616341584881257,
            upper: 0.49369203087585567
        },
        stretchRange: {
            lower: 1.1312612227616774,
            upper: 1.831251352498779
        },
        circularityRatio: {
            lower: 0.25852472308422597,
            upper: 0.6344181275984813
        }
    },
    {
        openRange: {
            lower: -0.051393795703870995,
            upper: 0.14425666664430492
        },
        stretchRange: {
            lower: 0.7257906117922185,
            upper: 1.114468592814084
        },
        circularityRatio: {
            lower: 2.225326612272873,
            upper: 6.381391372869524
        }
    },
    {
        openRange: {
            lower: -0.016171283341344177,
            upper: 0.09150772113938205
        },
        stretchRange: {
            lower: 0.6884618928280631,
            upper: 1.1075675839802341
        },
        circularityRatio: {
            lower: -0.2583749549864365,
            upper: 12.43275432273459
        }
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