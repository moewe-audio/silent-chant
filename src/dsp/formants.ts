export interface FormantFilter {
    freq: number,
    bandwidth: number,
    gain: number
}

export interface Formants {
    a: FormantFilter[],
    e: FormantFilter[],
    i: FormantFilter[],
    o: FormantFilter[],
    u: FormantFilter[],
}

export function mapVowelsToValue(value: number, voiceType: number): FormantFilter[] {
    const lenSegment = 1.0 / Object.keys(FORMANTS).length;
    for (let i = 0; i < Object.keys(FORMANTS).length; i++) {
        const seg = i * lenSegment;
        if (seg <= value && value < seg + lenSegment) {
            const t = (value - seg) / lenSegment;
            return interpolateFormants(getFormants(i, voiceType), getFormants((i + 1), voiceType), t);
        }
    }
    return [];
}


function interpolateFormants(formants1: FormantFilter[], formants2: FormantFilter[], t: number): FormantFilter[] {
    const interpolated: FormantFilter[] = [];
    for (let i = 0; i < formants1.length; i++) {
        interpolated.push({
            freq: linInt(formants1[i].freq, formants2[i].freq, t),
            bandwidth: linInt(formants1[i].bandwidth, formants2[i].bandwidth, t),
            gain: linInt(formants1[i].gain, formants2[i].gain, t),
        });
    }
    return interpolated;
}

function linInt(val1: number, val2: number, t: number): number {
    t = easeInOutCubic(t);
    return val1 * (1 - t) + val2 * t;
}

function easeInOutQuad(t: number): number {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

function easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
}

export function getFormants(index: number, voiceType: number): FormantFilter[] {
    switch (index) {
        case 0: return FORMANTS[voiceType].formants.a
        case 1: return FORMANTS[voiceType].formants.e
        case 2: return FORMANTS[voiceType].formants.i
        case 3: return FORMANTS[voiceType].formants.o
        case 4: return FORMANTS[voiceType].formants.u
        default: return FORMANTS[voiceType].formants.a 
    }
}

export const FORMANTS = [
    {
        voiceType: 'Bass',
        formants: {
            a: [
                { freq: 600, bandwidth: 60, gain: 0 },
                { freq: 1040, bandwidth: 70, gain: -7 },
                { freq: 2250, bandwidth: 110, gain: -9 },
                { freq: 2450, bandwidth: 120, gain: -9 },
                { freq: 2750, bandwidth: 130, gain: -20 }
            ],
            e: [
                { freq: 400, bandwidth: 40, gain: 0 },
                { freq: 1620, bandwidth: 80, gain: -12 },
                { freq: 2400, bandwidth: 100, gain: -9 },
                { freq: 2800, bandwidth: 120, gain: -12 },
                { freq: 3100, bandwidth: 120, gain: -18 }
            ],
            i: [
                { freq: 250, bandwidth: 60, gain: 0 },
                { freq: 1750, bandwidth: 90, gain: -30 },
                { freq: 2600, bandwidth: 100, gain: -16 },
                { freq: 3050, bandwidth: 120, gain: -22 },
                { freq: 3340, bandwidth: 120, gain: -28 }
            ],
            o: [
                { freq: 400, bandwidth: 40, gain: 0 },
                { freq: 750, bandwidth: 80, gain: -11 },
                { freq: 2400, bandwidth: 100, gain: -21 },
                { freq: 2600, bandwidth: 120, gain: -20 },
                { freq: 2900, bandwidth: 120, gain: -40 }
            ],
            u: [
                { freq: 350, bandwidth: 40, gain: 0 },
                { freq: 600, bandwidth: 80, gain: -20 },
                { freq: 2400, bandwidth: 100, gain: -32 },
                { freq: 2675, bandwidth: 120, gain: -28 },
                { freq: 2950, bandwidth: 120, gain: -36 }
            ]
        }
    },
    {
        voiceType: 'Baritone',
        formants: {
            a: [
                { freq: 550, bandwidth: 60, gain: 0 },
                { freq: 880, bandwidth: 80, gain: -4 },
                { freq: 2800, bandwidth: 100, gain: -16 },
                { freq: 2900, bandwidth: 110, gain: -20 },
                { freq: 3250, bandwidth: 120, gain: -28 }
            ],
            e: [
                { freq: 440, bandwidth: 70, gain: 0 },
                { freq: 1800, bandwidth: 80, gain: -12 },
                { freq: 2700, bandwidth: 100, gain: -14 },
                { freq: 3000, bandwidth: 120, gain: -18 },
                { freq: 3300, bandwidth: 120, gain: -20 }
            ],
            i: [
                { freq: 350, bandwidth: 50, gain: 0 },
                { freq: 1700, bandwidth: 90, gain: -24 },
                { freq: 2700, bandwidth: 100, gain: -30 },
                { freq: 3700, bandwidth: 120, gain: -36 },
                { freq: 4500, bandwidth: 120, gain: -40 }
            ],
            o: [
                { freq: 450, bandwidth: 50, gain: 0 },
                { freq: 800, bandwidth: 80, gain: -6 },
                { freq: 2830, bandwidth: 100, gain: -24 },
                { freq: 3000, bandwidth: 110, gain: -26 },
                { freq: 3300, bandwidth: 120, gain: -32 }
            ],
            u: [
                { freq: 325, bandwidth: 50, gain: 0 },
                { freq: 700, bandwidth: 80, gain: -24 },
                { freq: 2530, bandwidth: 100, gain: -30 },
                { freq: 2700, bandwidth: 110, gain: -34 },
                { freq: 2950, bandwidth: 120, gain: -40 }
            ]
        }
    },
    {
        voiceType: 'Tenor',
        formants: {
            a: [
                { freq: 650, bandwidth: 80, gain: 0 },
                { freq: 1080, bandwidth: 90, gain: -6 },
                { freq: 2650, bandwidth: 120, gain: -7 },
                { freq: 2900, bandwidth: 130, gain: -8 },
                { freq: 3250, bandwidth: 140, gain: -22 }
            ],
            e: [
                { freq: 400, bandwidth: 70, gain: 0 },
                { freq: 1700, bandwidth: 80, gain: -14 },
                { freq: 2600, bandwidth: 100, gain: -12 },
                { freq: 3200, bandwidth: 120, gain: -14 },
                { freq: 3580, bandwidth: 120, gain: -20 }
            ],
            i: [
                { freq: 290, bandwidth: 40, gain: 0 },
                { freq: 1870, bandwidth: 90, gain: -15 },
                { freq: 2800, bandwidth: 100, gain: -18 },
                { freq: 3250, bandwidth: 120, gain: -20 },
                { freq: 3540, bandwidth: 120, gain: -30 }
            ],
            o: [
                { freq: 400, bandwidth: 40, gain: 0 },
                { freq: 800, bandwidth: 80, gain: -10 },
                { freq: 2600, bandwidth: 100, gain: -12 },
                { freq: 2800, bandwidth: 120, gain: -12 },
                { freq: 3000, bandwidth: 120, gain: -26 }
            ],
            u: [
                { freq: 350, bandwidth: 40, gain: 0 },
                { freq: 600, bandwidth: 60, gain: -20 },
                { freq: 2700, bandwidth: 100, gain: -17 },
                { freq: 2900, bandwidth: 120, gain: -14 },
                { freq: 3300, bandwidth: 120, gain: -26 }
            ]
        }
    },
    {
        voiceType: 'Contralto',
        formants: {
            a: [
                { freq: 800, bandwidth: 80, gain: 0 },
                { freq: 1150, bandwidth: 90, gain: -6 },
                { freq: 2900, bandwidth: 120, gain: -9 },
                { freq: 3900, bandwidth: 130, gain: -9 },
                { freq: 4950, bandwidth: 140, gain: -20 }
            ],
            e: [
                { freq: 350, bandwidth: 60, gain: 0 },
                { freq: 1700, bandwidth: 80, gain: -14 },
                { freq: 2700, bandwidth: 100, gain: -12 },
                { freq: 3700, bandwidth: 120, gain: -12 },
                { freq: 4900, bandwidth: 120, gain: -20 }
            ],
            i: [
                { freq: 270, bandwidth: 50, gain: 0 },
                { freq: 1850, bandwidth: 90, gain: -15 },
                { freq: 2900, bandwidth: 100, gain: -18 },
                { freq: 3350, bandwidth: 120, gain: -20 },
                { freq: 4950, bandwidth: 120, gain: -30 }
            ],
            o: [
                { freq: 450, bandwidth: 70, gain: 0 },
                { freq: 800, bandwidth: 80, gain: -6 },
                { freq: 2830, bandwidth: 100, gain: -24 },
                { freq: 3800, bandwidth: 120, gain: -26 },
                { freq: 4950, bandwidth: 120, gain: -30 }
            ],
            u: [
                { freq: 325, bandwidth: 50, gain: 0 },
                { freq: 700, bandwidth: 60, gain: -20 },
                { freq: 2530, bandwidth: 100, gain: -30 },
                { freq: 3750, bandwidth: 120, gain: -34 },
                { freq: 4950, bandwidth: 120, gain: -40 }
            ]
        }
    },
    {
        voiceType: 'Soprano',
        formants: {
            a: [
                { freq: 800, bandwidth: 80, gain: 0 },
                { freq: 1150, bandwidth: 90, gain: -6 },
                { freq: 2900, bandwidth: 120, gain: -9 },
                { freq: 3900, bandwidth: 130, gain: -9 },
                { freq: 4950, bandwidth: 140, gain: -20 }
            ],
            e: [
                { freq: 350, bandwidth: 60, gain: 0 },
                { freq: 2000, bandwidth: 80, gain: -20 },
                { freq: 2800, bandwidth: 100, gain: -15 },
                { freq: 3600, bandwidth: 120, gain: -18 },
                { freq: 4950, bandwidth: 120, gain: -20 }
            ],
            i: [
                { freq: 270, bandwidth: 60, gain: 0 },
                { freq: 2140, bandwidth: 90, gain: -12 },
                { freq: 2950, bandwidth: 100, gain: -9 },
                { freq: 3900, bandwidth: 120, gain: -12 },
                { freq: 4950, bandwidth: 120, gain: -26 }
            ],
            o: [
                { freq: 450, bandwidth: 70, gain: 0 },
                { freq: 800, bandwidth: 80, gain: -6 },
                { freq: 2830, bandwidth: 100, gain: -24 },
                { freq: 3800, bandwidth: 120, gain: -26 },
                { freq: 4950, bandwidth: 120, gain: -34 }
            ],
            u: [
                { freq: 325, bandwidth: 50, gain: 0 },
                { freq: 700, bandwidth: 60, gain: -20 },
                { freq: 2530, bandwidth: 100, gain: -30 },
                { freq: 3650, bandwidth: 120, gain: -34 },
                { freq: 4950, bandwidth: 120, gain: -40 }
            ]
        }
    }
];