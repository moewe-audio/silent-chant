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

export function mapVowelsToValue(value: number): FormantFilter[] {
    const lenSegment = 1.0 / Object.keys(FORMANTS).length;
    for (let i = 0; i < Object.keys(FORMANTS).length - 1; i++) {
        const seg = i * lenSegment;
        if (seg <= value && value < seg + lenSegment) {
            const t = (value - seg) / lenSegment;
            return interpolateFormants(getFormants(i), getFormants(i + 1), t);
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
    return val1 * (1 - t) + val2 * t;
}

function getFormants(index: number): FormantFilter[] {
    switch (index) {
        case 0:
            return FORMANTS.a
        case 1:
            return FORMANTS.e
        case 2:
            return FORMANTS.i
        case 3:
            return FORMANTS.o
        case 4:
            return FORMANTS.u
        default:
            return FORMANTS.a
    }
}

export const FORMANTS: Formants = {
    a: [
        {
            freq: 650,
            bandwidth: 80,
            gain: 0
        },
        {
            freq: 1080,
            bandwidth: 90,
            gain: -6
        },
        {
            freq: 2650,
            bandwidth: 120,
            gain: -7
        },
        {
            freq: 2900,
            bandwidth: 130,
            gain: -8
        },
        {
            freq: 3250,
            bandwidth: 140,
            gain: -22
        }
    ],
    e: [
        {
            freq: 400,
            bandwidth: 70,
            gain: 0
        },
        {
            freq: 1700,
            bandwidth: 80,
            gain: -14
        },
        {
            freq: 2600,
            bandwidth: 100,
            gain: -12
        },
        {
            freq: 3200,
            bandwidth: 120,
            gain: -14
        },
        {
            freq: 3580,
            bandwidth: 120,
            gain: -20
        }
    ],
    i: [
        {
            freq: 290,
            bandwidth: 40,
            gain: 0
        },
        {
            freq: 1870,
            bandwidth: 90,
            gain: -15
        },
        {
            freq: 2800,
            bandwidth: 100,
            gain: -18
        },
        {
            freq: 3250,
            bandwidth: 120,
            gain: -20
        },
        {
            freq: 3540,
            bandwidth: 120,
            gain: -30
        }
    ],
    o: [
        {
            freq: 400,
            bandwidth: 40,
            gain: 0
        },
        {
            freq: 800,
            bandwidth: 80,
            gain: -10
        },
        {
            freq: 2600,
            bandwidth: 100,
            gain: -12
        },
        {
            freq: 2800,
            bandwidth: 120,
            gain: -12
        },
        {
            freq: 3000,
            bandwidth: 120,
            gain: -26
        }
    ],
    u: [
        {
            freq: 350,
            bandwidth: 40,
            gain: 0
        },
        {
            freq: 600,
            bandwidth: 60,
            gain: -20
        },
        {
            freq: 2700,
            bandwidth: 100,
            gain: -17
        },
        {
            freq: 2900,
            bandwidth: 120,
            gain: -14
        },
        {
            freq: 3300,
            bandwidth: 120,
            gain: -26
        }
    ]
}
