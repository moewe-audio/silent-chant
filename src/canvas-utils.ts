import { Coordinate, LipLandmarks } from "./constants";
import { ProcessingResult } from "./processor";

const scalingFactor = 50;

export const drawLipModel = (procResult: ProcessingResult, ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    // if (!procResult.landmarks || !procResult.landmarks.lipsUpperOuter) return;
    const landmarks: LipLandmarks = procResult.landmarks;
    if (!landmarks.lipsLowerInner) return;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    const middlePoint: Coordinate = landmarks.lipsUpperOuter[5];
    const scale = procResult.refDistance * scalingFactor;
    landmarks.lipsUpperInner.forEach((up, idx) => {
        const low = landmarks.lipsLowerInner[idx];
        if (!low) return;
        const height = normalize(Math.abs(low.y - up.y), procResult);
        const offsetX1 = normalize((up.x - middlePoint.x), procResult);
        const offsetX2 = normalize(low.x - middlePoint.x, procResult);
        drawVerticalLine(height, offsetX1, offsetX2, centerX, centerY, ctx);
        const outer = landmarks.lipsUpperOuter[idx];
        const offsetX3 = normalize(outer.x - middlePoint.x, procResult);
        const width = procResult.lipWidthsUpper[idx] * scalingFactor;
        drawLipWidth(ctx, centerX, offsetX1, centerY, height, offsetX3, width);
    });
    landmarks.lipsLowerInner.forEach((inner, idx) => {
        const height = procResult.innerHeightVector[idx] * scalingFactor;
        const outer = landmarks.lipsLowerOuter[idx];
        if (!outer) return;
        const offsetX1 = normalize(inner.x - middlePoint.x, procResult);
        const offsetX2 = normalize(outer.x - middlePoint.x, procResult);
        const width = procResult.lipWidthsLower[idx] * scalingFactor;
        drawLipWidth(ctx, centerX, offsetX1, centerY, -height, offsetX2, -width);
    });
}

function drawLipWidth(ctx: CanvasRenderingContext2D, centerX: number, offsetX1: number, centerY: number, height: number, offsetX3: number, width: number) {
    ctx.strokeStyle = 'red';
    ctx.beginPath();
    ctx.moveTo(centerX + offsetX1, centerY + ((height / 2)));
    ctx.lineTo(centerX + offsetX3, centerY + (height / 2) + width);
    ctx.stroke();
}

function drawHorizontalLine(width: number, offsetY: number, centerX: number, centerY: number, ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.moveTo(centerX - (width / 2), centerY + offsetY);
    ctx.lineTo(centerX + (width / 2), centerY + offsetY);
    ctx.stroke();
}

function drawVerticalLine(height: number, offsetX1: number, offsetX2: number, centerX: number, centerY: number, ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = 'black';
    ctx.beginPath();
    ctx.moveTo(centerX + offsetX1, centerY - (height / 2));
    ctx.lineTo(centerX + offsetX2, centerY + (height / 2));
    ctx.stroke();
}

function normalize(value: number, procResult: ProcessingResult) {
    return value / procResult.refDistance * scalingFactor;
}