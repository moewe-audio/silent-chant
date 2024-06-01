import { asin, cross } from "mathjs";
import { Coordinate } from "../constants";

export function estimateHeadPitch(landmarks: any) {
    const pCenterMark = landmarks[4];
    const pLeftMark = landmarks[50];
    const pRightMark = landmarks[280];
    return calculatePitch(
        {
            x: pCenterMark.x,
            y: pCenterMark.y,
            z: pCenterMark.z
        },
        {
            x: pLeftMark.x,
            y: pLeftMark.y,
            z: pLeftMark.z
        },
        {
            x: pRightMark.x,
            y: pRightMark.y,
            z: pRightMark.z
        }
    );
}

function calculateDistance(c1: Coordinate, c2: Coordinate): number {
    return Math.sqrt((c1.x - c2.x) ** 2 + (c1.y - c2.y) ** 2 + (c1.z - c2.z) ** 2);
  }
  
  function crossProduct(a: number[], b: number[]): number[] {
    return cross(a, b) as number[];
  }
  
  function euclideanNorm(a: number[]): number {
    return Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  }
  
  function calculatePitch(l4: Coordinate, l50: Coordinate, l280: Coordinate): number {
    const A = calculateDistance(l50, l4);
    const B = calculateDistance(l280, l4);
  
    const P50 = [l50.x, l50.y, l50.z];
    const P280 = [l280.x, l280.y, l280.z];
    const P4 = [l4.x, l4.y, l4.z];
  
    const verDist4 = euclideanNorm(
        crossProduct(
            [P280[0] - P50[0], P280[1] - P50[1], P280[2] - P50[2]], 
            [P4[0] - P50[0], P4[1] - P50[1], P4[2] - P50[2]]
        )
    ) / euclideanNorm([P280[0] - P50[0], P280[1] - P50[1], P280[2] - P50[2]]);
  
    const thetaPitchLeft: number = ((B > verDist4) ? asin(verDist4 / B) : (B < verDist4) ? asin(B / verDist4) : 0) as number;
    const thetaPitchRight: number = ((A > verDist4) ? asin(verDist4 / A) : (A < verDist4) ? asin(A / verDist4) : 0) as number;
  
    return (thetaPitchLeft + thetaPitchRight) / 2;
  }