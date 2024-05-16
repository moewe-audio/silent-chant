import { ProcessingResult, lastResult } from "./processor";

export let lastEstimate: number[] = [0, 0, 0, 0, 0]

interface Range {
    lower: number,
    upper: number
}

interface EstimatorRange {
    openRange: Range,
    stretchRange: Range,
    lipThicknessRange: Range
}

export const RANGES: EstimatorRange[] = [
    {
        openRange: { lower: 0.2, upper: 2 },
        stretchRange: { lower: 1, upper: 1.3 },
        lipThicknessRange: { lower: 0.6, upper: 0.9 },
    },
    {
        openRange: { lower: 0.48, upper: 1.04 },
        stretchRange: { lower: 1.6, upper: 2 },
        lipThicknessRange: { lower: 0.56, upper: 0.78 },
    },
    {
        openRange: { lower: 0.44, upper: 0.9 },
        stretchRange: { lower: 1.4, upper: 2 },
        lipThicknessRange: { lower: 0.48, upper: 0.74 },
    },
    {
        openRange: { lower: 0.08, upper: 0.7 },
        stretchRange: { lower: 0.54, upper: 0.96 },
        lipThicknessRange: { lower: 0.68, upper: 1.12 },
    },
    {
        openRange: { lower: 0.02, upper: 0.46 },
        stretchRange: { lower: 0.58, upper: 0.86 },
        lipThicknessRange: { lower: 0.82, upper: 1.02 },
    }
];

export function estimateVowels(procResult: ProcessingResult): number[] {
    lastEstimate = RANGES.map(range => {
        let avg = 0;
        avg += inRange(procResult.openessEstimate, range.openRange) 
            * distToMiddle(procResult.openessEstimate, range.openRange);
        avg += inRange(procResult.stretch, range.stretchRange) 
            * distToMiddle(procResult.stretch, range.stretchRange);
        avg += inRange(procResult.lipThickness, range.lipThicknessRange) 
            * distToMiddle(procResult.lipThickness, range.lipThicknessRange);
        return (avg / 3.0) * mouthSufficientlyOpened(procResult.openessEstimate, range.openRange);
    });
    return lastEstimate;
}

function inRange(value: number, range: Range): number {
    return value >= range.lower && value <= range.upper ? 1 : 0;
}

function distToMiddle(value: number, range: Range): number {
    return Math.abs(value - ((range.lower + range.upper) / 2));
}

function mouthSufficientlyOpened(value: number, range: Range): number {
    return value >= range.lower ? 1 : 0;
}