///<reference types="@grame/faustwasm"/>

import { FaustAudioWorkletNode, FaustCmajor, FaustCompiler, FaustDspMeta, FaustMonoDspGenerator, FaustPolyDspGenerator, IFaustMixerInstance, LibFaust, LooseFaustDspFactory, instantiateFaustModuleFromFile } from "@grame/faustwasm";

export function load() {
    
}

/**
 * Creates a Faust audio node for use in the Web Audio API.
 *
 * @param {AudioContext} audioContext - The Web Audio API AudioContext to which the Faust audio node will be connected.
 * @param {string} dspName - The name of the DSP to be loaded.
 * @param {number} voices - The number of voices to be used for polyphonic DSPs.
 * @param {boolean} sp - Whether to create a ScriptProcessorNode instead of an AudioWorkletNode.
 * @returns {Object} - An object containing the Faust audio node and the DSP metadata.
 */
export async function createFaustPolyNode(audioContext: AudioContext, dspName = "template", voices: number): Promise<
{
    faustNode: FaustAudioWorkletNode,
    dspMeta: FaustDspMeta,
}> {
    // Import necessary Faust modules and data
    
    // const { FaustMonoDspGenerator, FaustPolyDspGenerator } = await import("./faustwasm/index.js");

    // Load DSP metadata from JSON
    /** @type {FaustDspMeta} */
    const dspMeta: FaustDspMeta = await (await fetch(`./faustwasm/poly/${dspName}.json`)).json();

    // Compile the DSP module from WebAssembly binary data
    const dspModule: WebAssembly.Module = await WebAssembly.compileStreaming(await fetch(`./faustwasm/poly/${dspName}.wasm`));

    // Create an object representing Faust DSP with metadata and module
    /** @type {FaustDspDistribution} */
    let faustDsp: any = { dspMeta, dspModule };

    /** @type {FaustAudioWorkletNode} */
    let faustNode: FaustAudioWorkletNode; 
    // Create either a polyphonic or monophonic Faust audio node based on the number of voices

    try {
        faustDsp = {...faustDsp, 
            mixerModule: await WebAssembly.compileStreaming(await fetch("./faustwasm/poly/mixerModule.wasm")) as IFaustMixerInstance,
        };
        
    } catch (e) { }

    const generator = new FaustPolyDspGenerator();
    faustNode = await generator.createNode(
        audioContext,
        voices,
        "FaustPolyDSP",
        { module: faustDsp.dspModule, json: JSON.stringify(faustDsp.dspMeta) } as LooseFaustDspFactory,
        faustDsp.mixerModule,
        undefined,
        false
    ) as FaustAudioWorkletNode;
    // const generator = new FaustMonoDspGenerator();
    // faustNode = await generator.createNode(
    //     audioContext,
    //     "FaustMonoDSP",
    //     { module: faustDsp.dspModule, json: JSON.stringify(faustDsp.dspMeta) }  as LooseFaustDspFactory,
    //     false
    // ) as FaustAudioWorkletNode;
    return { faustNode, dspMeta };
}

/**
 * Creates a Faust audio node for use in the Web Audio API.
 *
 * @param {AudioContext} audioContext - The Web Audio API AudioContext to which the Faust audio node will be connected.
 * @param {string} dspName - The name of the DSP to be loaded.
 * @param {number} voices - The number of voices to be used for polyphonic DSPs.
 * @param {boolean} sp - Whether to create a ScriptProcessorNode instead of an AudioWorkletNode.
 * @returns {Object} - An object containing the Faust audio node and the DSP metadata.
 */
export async function createFaustMonoNode(audioContext: AudioContext, dspName = "template"): Promise<
{
    faustNode: FaustAudioWorkletNode,
    dspMeta: FaustDspMeta,
}> {
    // Import necessary Faust modules and data
    // Load DSP metadata from JSON
    /** @type {FaustDspMeta} */
    const dspMeta: FaustDspMeta = await (await fetch(`./faustwasm/mono/${dspName}.json`)).json();

    // Compile the DSP module from WebAssembly binary data
    const dspModule: WebAssembly.Module = await WebAssembly.compileStreaming(await fetch(`./faustwasm/mono/${dspName}.wasm`));

    // Create an object representing Faust DSP with metadata and module
    /** @type {FaustDspDistribution} */
    let faustDsp: any = { dspMeta, dspModule };

    /** @type {FaustAudioWorkletNode} */
    let faustNode: FaustAudioWorkletNode; 
    const generator = new FaustMonoDspGenerator();
    faustNode = await generator.createNode(
        audioContext,
        "FaustMonoDSP",
        { module: faustDsp.dspModule, json: JSON.stringify(faustDsp.dspMeta) }  as LooseFaustDspFactory,
        false
    ) as FaustAudioWorkletNode;
    return { faustNode, dspMeta };
}