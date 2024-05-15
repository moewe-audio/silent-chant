import { lastResult } from "./processor";

export function updateBar() {
    const barContainer = document.querySelector(`.bar-container[data-bar-id="openValue"]`);
    if (barContainer) {
        const bar: HTMLElement = barContainer.querySelector('.bar')!;
        bar.style.width = (lastResult.openessEstimate * 50) + '%';
    }
    const stretchBar = document.querySelector(`.bar-container[data-bar-id="stretchValue"]`);
    if (stretchBar) {
        const bar: HTMLElement = stretchBar.querySelector('.bar')!;
        bar.style.width = (lastResult.width * 50) + '%';
    }
    const lipThicknessBar = document.querySelector(`.bar-container[data-bar-id="lipThickness"]`);
    if (lipThicknessBar) {
        const bar: HTMLElement = lipThicknessBar.querySelector('.bar')!;
        bar.style.width = (lastResult.lipThickness * 50) + '%';
    }
}