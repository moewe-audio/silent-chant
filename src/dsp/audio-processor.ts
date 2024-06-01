import { FaustAudioWorkletNode, FaustDspMeta } from "@grame/faustwasm";
import { lastEstimate } from "../landmark-processing/vowel-estimate";
import { createFaustMonoNode } from "./faust-loader";
import { lastResult } from "../landmark-processing/processor";

class ParameterSmoother {
    private alpha: number;
    private smoothedValue: number;

    constructor(initialValue: number, alpha: number) {
        this.alpha = alpha;
        this.smoothedValue = initialValue;
    }

    public update(currentValue: number): number {
        this.smoothedValue = this.alpha * currentValue + (1 - this.alpha) * this.smoothedValue;
        return this.smoothedValue;
    }

    public getValue(): number {
        return this.smoothedValue;
    }
}


export let audioContext: AudioContext;
let formantParameter: number = 0.0;
const smoothFormant = new ParameterSmoother(0, 0.6);
export let faustNode: {
    faustNode: FaustAudioWorkletNode<false>;
    gain: GainNode;
    dspMeta: FaustDspMeta;
};

export interface Voice {
    pulseOscillator: OscillatorNode,
    gainNode: GainNode,
    filters: BiquadFilterNode[],
    voiceType: number,
    lfo: OscillatorNode,
    lfoGain: GainNode
}

export async function initAudio() {
    audioContext = new window.AudioContext();
    const node = await createFaustMonoNode(audioContext, "fofMono");
    node.faustNode.start();
    node.faustNode.parameters.get("/vocal/gain")?.setValueAtTime(0, audioContext.currentTime);
    node.faustNode.setParamValue("/vocal/voiceType", 2);
    const gain = audioContext.createGain();
    gain.gain.setValueAtTime(0.13, audioContext.currentTime);
    node.faustNode.connect(gain);
    gain.connect(audioContext.destination); 
    // node.faustNode.setParamValue("/vocal/vibratoFreq", 2);
    // node.faustNode.setParamValue("/vocal/vibratoGain", 0.2);
    faustNode = {...node, gain};
    setInterval(updateLiveParameters, 10);
}

function updateLiveParameters() {
    formantParameter = smoothFormant.update(lastEstimate.vowelMaxScore);
    if (formantParameter >= 0 && formantParameter <= 4) {
        faustNode.faustNode.setParamValue("/vocal/vowel", formantParameter);
    }
    const vFreq = 7 + (lastResult.headPitch - 0.68) * 40;
    if (vFreq >= 0 && vFreq <= 10) {
        faustNode.faustNode.setParamValue("/vocal/vibratoFreq", vFreq);
    }
}