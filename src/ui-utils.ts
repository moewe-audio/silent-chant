import { lastResult } from "./processor";
import { RANGES, lastEstimate } from "./vowel-estimate";

const SCALE = 50;

const VOWEL_COLORS = [
    "red",
    "blue",
    "green",
    "purple",
    "yellow"
]

export function init() {
    RANGES.forEach((range, idx) => {
        addRangeIndicator("openValue", range.openRange.lower * SCALE, range.openRange.upper * SCALE, VOWEL_COLORS[idx]);
        addRangeIndicator("stretchValue", range.stretchRange.lower * SCALE, range.stretchRange.upper * SCALE, VOWEL_COLORS[idx]);
        addRangeIndicator("lipThickness", range.lipThicknessRange.lower * SCALE, range.lipThicknessRange.upper * SCALE, VOWEL_COLORS[idx]);
    })
}

export function updateUi() {
    updateBar();
    updateCards();
}

export function updateBar() {
    updateSliderValue("openValue", lastResult.openessEstimate);
    updateSliderValue("stretchValue", lastResult.width);
    updateSliderValue("lipThickness", lastResult.lipThickness);
}

export function updateCards() {
    lastEstimate.forEach((est, idx) => {
        updateCardValue(idx, est);
    });
}

function updateSliderValue(barId: string, value: number) {
    const barContainer = document.querySelector(`[data-bar-id="${barId}"]`) as HTMLElement;
    const bar = barContainer.querySelector('.bar') as HTMLElement;
    bar.style.width = `${value * SCALE}%`;
}

function addRangeIndicator(barId: string, min: number, max: number, color: string) {
    const barContainer = document.querySelector(`[data-bar-id="${barId}"]`) as HTMLElement;
    const rangeIndicator = document.createElement('div');
    rangeIndicator.className = 'range-indicator';
    rangeIndicator.style.width = `${max - min}%`;
    rangeIndicator.style.left = `${min}%`;
    rangeIndicator.setAttribute('data-color', color);
    barContainer.appendChild(rangeIndicator);
}

function updateCardValue(vowelIndex: number, value: number) {
    const card = document.querySelector(`[data-vowel-id="${vowelIndex}"]`) as HTMLElement;
    card.style.backgroundColor = `rgba(193, 77, 197, ${value * 200}%)`;
}