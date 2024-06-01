import { Coordinate, LipLandmarks, LIP_LANDMARKS, LipIndices } from '../constants'
import { estimateHeadPitch } from './head-pitch-est';

export interface ProcessingResult {
    landmarks: LipLandmarks,
    lipWidthsUpper: number[],
    lipWidthsLower: number[],
    innerHeightVector: number[],
    openessEstimate: number,
    stretch: number,
    width: number,
    lipThickness: number,
    refDistance: number,
    circularityRatio: number,
    headPitch: number,
}

export let lastResult: ProcessingResult = {
    landmarks: {} as LipLandmarks,
    lipWidthsUpper: [],
    lipWidthsLower: [],
    innerHeightVector: [],
    openessEstimate: 0,
    stretch: 0,
    width: 0,
    refDistance: 0,
    lipThickness: 0,
    circularityRatio: 0,
    headPitch: 0,
};

export function process(landmarks: any) {
    const lipLandmarks: LipLandmarks = getLipLandmarks(landmarks);
    const rightRef = landmarks[133];
    const leftRef = landmarks[362];
    const refDist = Math.sqrt(((rightRef.x - leftRef.x) ** 2) 
    + ((rightRef.y - leftRef.y) ** 2) + ((rightRef.z - leftRef.z) ** 2));
    processLipLandmarks(lipLandmarks, refDist);
    lastResult.headPitch = estimateHeadPitch(landmarks);
}

export function processLipLandmarks(landmarks: LipLandmarks, ref: number) {
    const zNormalizedLandmarks: LipLandmarks = {
        lipsLowerInner: landmarks.lipsLowerInner.map(normalizeCoordinate),
        lipsLowerOuter: landmarks.lipsLowerOuter.map(normalizeCoordinate),
        lipsUpperInner: landmarks.lipsUpperInner.map(normalizeCoordinate),
        lipsUpperOuter: landmarks.lipsUpperOuter.map(normalizeCoordinate),
    }
    const [openEst, heightVector] = calculateHeight(landmarks, ref);
    const [lipWidthUpper, lipWidthLower, lipThickness] = getLipWidths(landmarks, ref);
    lastResult = {
        landmarks: landmarks,
        lipWidthsUpper: lipWidthUpper,
        lipWidthsLower: lipWidthLower,
        innerHeightVector: heightVector,
        openessEstimate: openEst,
        stretch: calculateStretch(landmarks, ref),
        width: calculateWidth(landmarks, ref),
        lipThickness: lipThickness,
        refDistance: ref,
        circularityRatio: calculateRoundnessMetric(getOuterGraph(landmarks), ref) * 0.01
    } as ProcessingResult
    return lastResult;
}

function calculateHeight(landmarks: LipLandmarks, ref: number): [number, number[]] {
    let norm4 = 0;
    let heightVector: number[] = [];
    let area = 0;
    landmarks.lipsUpperInner.forEach((up, idx) => {
        const low = landmarks.lipsLowerInner[idx];
        if (!low) return;
        // const height = Math.abs(low.y - up.y) / ref;
        const height = distance(up, low, ref);
        heightVector[idx] = height;
        norm4 += height ** 4;
    });
    area = calculateArea(getInnerGraph(landmarks), ref);
    norm4 = norm4 ** (1.0 / 4.0);
    return [area, heightVector];
}

function calculateStretch(landmarks: LipLandmarks, ref: number): number {
    let norm4 = 0;
    let n = 0;
    for (let key in landmarks) {
        const sub: Coordinate[] = landmarks[key as keyof LipLandmarks];
        sub.forEach((point, idx) => {
            // Euclidean distance to next point
            if (!sub[idx + 1]) return;
            const other: Coordinate = sub[idx + 1];
            norm4 += distance(other, point, ref) ** 4;
            n++;
        });
    }
    return norm4 ** (1.0 / 4);
}

function calculateWidth(landmarks: LipLandmarks, ref: number): number {
    const p1 = landmarks.lipsUpperInner[0];
    const p2 = landmarks.lipsUpperInner[landmarks.lipsUpperInner.length - 1];
    if (!(p1 && p2)) return 0;
    return distance(p1, p2, ref);
}

function getLipWidths(landmarks: LipLandmarks, ref: number): [number[], number[], number] {
    let widthUpperVector: number[] = [];
    let norm4 = 0;
    landmarks.lipsUpperInner.forEach((up, idx) => {
        const other = landmarks.lipsUpperOuter[idx];
        if (!other) return;
        const height = distance(up, other, ref);
        norm4 += height ** 4;
        widthUpperVector[idx] = height;
    });
    let widthLowerVector: number[] = [];
    landmarks.lipsLowerInner.forEach((up, idx) => {
        const other = landmarks.lipsLowerOuter[idx];
        if (!other) return;
        const height = distance(up, other, ref);
        norm4 += height ** 4;
        widthLowerVector[idx] = height;
    });
    norm4 = norm4 ** (1.0 / 4.0);
    return [widthUpperVector, widthLowerVector, norm4];
}

function normalizeCoordinate(c: Coordinate): Coordinate {
    return {
        x: c.x * c.z,
        y: c.y * c.z,
        z: c.z,
    };
}

function getLipLandmarks(landmarks: any) {
    let lipLandmarks: LipLandmarks = {
        lipsLowerInner: [],
        lipsLowerOuter: [],
        lipsUpperInner: [],
        lipsUpperOuter: []
    };
    for (const key in LIP_LANDMARKS) {
        const indices = LIP_LANDMARKS[key as keyof LipIndices];
        lipLandmarks[key as keyof LipLandmarks] = indices
            .map(idx => {
                return {
                    x: landmarks[idx].x,
                    y: landmarks[idx].y,
                    z: landmarks[idx].z,
                } as Coordinate;
            });
    }
    return lipLandmarks;
}

function getInnerGraph(landmarks: LipLandmarks): Coordinate[] {
    const graph: Coordinate[] = [];
    for(let i = landmarks.lipsUpperInner.length - 1; i >= 0; i--) {
        graph.push(landmarks.lipsUpperInner[i]);
    }
    for(let i = 0; i < landmarks.lipsLowerInner.length; i++) {
        graph.push(landmarks.lipsLowerInner[i]);
    }
    return graph;
}

function getOuterGraph(landmarks: LipLandmarks): Coordinate[] {
    const graph: Coordinate[] = [];
    for(let i = landmarks.lipsUpperOuter.length - 1; i >= 0; i--) {
        graph.push(landmarks.lipsUpperOuter[i]);
    }
    for(let i = 0; i < landmarks.lipsLowerOuter.length; i++) {
        graph.push(landmarks.lipsLowerOuter[i]);
    }
    return graph;
}

function distance(c1: Coordinate, c2: Coordinate, ref: number): number {
    return Math.sqrt(Math.pow(c2.x - c1.x, 2) + Math.pow(c2.y - c1.y, 2)) / ref;
}

function calculateArea(points: Coordinate[], ref: number): number {
    let area = 0;
    for (let i = 0; i < points.length - 1; i++) {
        area += (points[i].x * points[i + 1].y) - (points[i + 1].x * points[i].y);
    }
    area += (points[points.length - 1].x * points[0].y) - (points[0].x * points[points.length - 1].y);
    return Math.abs(area) / (2 * Math.pow(ref, 2));
}

function calculatePerimeter(points: Coordinate[], ref: number): number {
    let perimeter = 0;
    for (let i = 0; i < points.length - 1; i++) {
        perimeter += distance(points[i], points[i + 1], ref);
    }
    perimeter += distance(points[points.length - 1], points[0], ref);
    return perimeter;
}

function calculateCircularityRatio(points: Coordinate[], ref: number): number {
    const perimeter = calculatePerimeter(points, ref);
    const area = calculateArea(points, ref);
    const circularityRatio = area / (Math.PI * Math.pow(perimeter / (2 * Math.PI), 2));
    return circularityRatio;
}

function calculateCentroid(lipGraph: Coordinate[]): Coordinate {
    const sum = lipGraph.reduce((acc, point) => {
        acc.x += point.x;
        acc.y += point.y;
        return acc;
    }, { x: 0, y: 0 });

    const centroid = {
        x: sum.x / lipGraph.length,
        y: sum.y / lipGraph.length,
        z: 0
    };

    return centroid;
}

function calculateDistancesFromCentroid(landmarks: Coordinate[], centroid: Coordinate, ref: number): number[] {
    return landmarks.map(point => {
        const dx = point.x - centroid.x;
        const dy = point.y - centroid.y;
        return Math.sqrt(dx * dx + dy * dy) / ref;
    });
}

function calculateVariance(values: number[]): number {
    const mean = values.reduce((acc, val) => acc + val, 0) / values.length;
    const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
    return variance;
}

function calculateRoundnessMetric(landmarks: Coordinate[], ref: number): number {
    const centroid = calculateCentroid(landmarks);
    const distances = calculateDistancesFromCentroid(landmarks, centroid, ref);
    const variance = calculateVariance(distances);
    const roundnessMetric = 1 / variance;
    return roundnessMetric;
}