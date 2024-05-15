import { Coordinate, LipLandmarks, LIP_LANDMARKS, LipIndices } from './constants'

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
};

export function process(landmarks: any) {
    const lipLandmarks: LipLandmarks = getLipLandmarks(landmarks);
    const rightRef = landmarks[133];
    const leftRef = landmarks[362];
    const refDist = Math.sqrt(((rightRef.x - leftRef.x) ** 2) 
    + ((rightRef.y - leftRef.y) ** 2) + ((rightRef.z - leftRef.z) ** 2));
    processLandmarks(lipLandmarks, refDist);
}

export function processLandmarks(landmarks: LipLandmarks, ref: number) {
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
        refDistance: ref
    } as ProcessingResult
    return lastResult;
}

function calculateHeight(landmarks: LipLandmarks, ref: number): [number, number[]] {
    let norm4 = 0;
    let heightVector: number[] = [];
    landmarks.lipsUpperInner.forEach((up, idx) => {
        const low = landmarks.lipsLowerInner[idx];
        if (!low) return;
        const height = Math.abs(low.y - up.y) / ref;
        heightVector[idx] = height;
        norm4 += height ** 4;
    });
    norm4 = norm4 ** (1.0 / 4.0);
    return [norm4, heightVector];
}

function calculateStretch(landmarks: LipLandmarks, ref: number): number {
    let norm2 = 0;
    let n = 0;
    for (let key in landmarks) {
        const sub: Coordinate[] = landmarks[key as keyof LipLandmarks];
        sub.forEach((point, idx) => {
            // Euclidean distance to next point
            if (!sub[idx + 1]) return;
            const other: Coordinate = sub[idx + 1];
            norm2 += Math.sqrt((((point.x - other.x) ** 2) + ((point.y - other.y) ** 2) / ref)) ** 4;
            n++;
        });
    }
    return norm2 ** (1.0 / 4);
}

function calculateWidth(landmarks: LipLandmarks, ref: number): number {
    const p1 = landmarks.lipsUpperInner[0];
    const p2 = landmarks.lipsUpperInner[landmarks.lipsUpperInner.length - 1];
    if (!(p1 && p2)) return 0;
    return Math.abs(p1.x - p2.x) / ref;
}

function getLipWidths(landmarks: LipLandmarks, ref: number): [number[], number[], number] {
    let widthUpperVector: number[] = [];
    let norm4 = 0;
    landmarks.lipsUpperInner.forEach((up, idx) => {
        const other = landmarks.lipsUpperOuter[idx];
        if (!other) return;
        const height = Math.abs(other.y - up.y) / ref;
        norm4 += height ** 4;
        widthUpperVector[idx] = height;
    });
    let widthLowerVector: number[] = [];
    landmarks.lipsLowerInner.forEach((up, idx) => {
        const other = landmarks.lipsLowerOuter[idx];
        if (!other) return;
        const height = Math.abs(other.y - up.y) / ref;
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
