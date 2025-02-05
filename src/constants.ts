export interface Coordinate {
    x: number,
    y: number,
    z: number,
}

export type LipLandmarks = {
    lipsUpperInner: Coordinate[],
    lipsLowerInner: Coordinate[],
    lipsUpperOuter: Coordinate[],
    lipsLowerOuter: Coordinate[],
}

export type LipIndices = {
    lipsUpperInner: number[],
    lipsLowerInner: number[],
    lipsUpperOuter: number[],
    lipsLowerOuter: number[],
}

export const LIP_LANDMARKS: LipIndices = {
    lipsUpperInner: [78, 191, 80, 81, 82, 13, 312, 311, 310, 415, 308],
    lipsLowerInner: [78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308],
    lipsUpperOuter: [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291],
    lipsLowerOuter: [146, 91, 181, 84, 17, 314, 405, 321, 375, 291]
}
