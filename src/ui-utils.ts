import { lastResult } from "./processor";
import { RANGES, lastEstimate } from "./vowel-estimate";

const SCALERS = new Map<string, number>([
    ["openValue", 50],
    ["stretchValue", 50],
    ["circularityRatio", 50]
]);

const VOWEL_COLORS = [
    "red",
    "blue",
    "green",
    "purple",
    "yellow"
]

export function init() {
    RANGES.forEach((range, idx) => {
        addRangeIndicator("openValue", range.openRange.lower, range.openRange.upper, idx);
        addRangeIndicator("stretchValue", range.stretchRange.lower, range.stretchRange.upper, idx);
        addRangeIndicator("circularityRatio", range.circularityRatio.lower, range.circularityRatio.upper, idx);
    })
}

export function updateUi() {
    updateBar();
    updateCards();
}

export function updateBar() {
    updateSliderValue("openValue", lastResult.openessEstimate);
    updateSliderValue("stretchValue", lastResult.width);
    updateSliderValue("circularityRatio", lastResult.circularityRatio);
}

export function updateCards() {
    lastEstimate.forEach((est, idx) => {
        updateCardValue(idx, est);
    });
}

function updateSliderValue(barId: string, value: number) {
    const barContainer = document.querySelector(`[data-bar-id="${barId}"]`) as HTMLElement;
    const bar = barContainer.querySelector('.bar') as HTMLElement;
    bar.style.width = `${value * SCALERS.get(barId)!}%`;
}

function addRangeIndicator(barId: string, min: number, max: number, vowelId: number) {
    const barContainer = document.querySelector(`[data-bar-id="${barId}"]`) as HTMLElement;
    const rangeIndicator = document.createElement('div');
    rangeIndicator.className = 'range-indicator';
    max *= SCALERS.get(barId)!;
    min *= SCALERS.get(barId)!;
    rangeIndicator.style.width = `${max - min}%`;
    rangeIndicator.style.left = `${min}%`;
    rangeIndicator.setAttribute('data-color', VOWEL_COLORS[vowelId]);
    rangeIndicator.setAttribute('data-range-id', `${vowelId}`);
    barContainer.appendChild(rangeIndicator);
}

export function updateRangeIndicator(barId: string, min: number, max: number, vowelIndex: number) {
    const barContainer = document.querySelector(`[data-bar-id="${barId}"]`) as HTMLElement;
    const rangeIndicator = barContainer.querySelector(`[data-range-id="${vowelIndex}"]`) as HTMLElement;
    if (!rangeIndicator) return;
    max *= SCALERS.get(barId)!;
    min *= SCALERS.get(barId)!;
    rangeIndicator.style.width = `${max - min}%`;
    rangeIndicator.style.left = `${min}%`;
}

function updateCardValue(vowelIndex: number, value: number) {
    const card = document.querySelector(`[data-vowel-id="${vowelIndex}"]`) as HTMLElement;
    card.style.backgroundColor = `rgba(193, 77, 197, ${value * 50}%)`;
}