import { initSync, MpmPitchDetector } from '@workspace/lib';
import type { ProcessorOptions } from './types';

class Processor extends AudioWorkletProcessor {
  pitchDetector: MpmPitchDetector;

  constructor({ processorOptions }: { processorOptions: ProcessorOptions }) {
    super();

    initSync(processorOptions.module);

    this.pitchDetector = new MpmPitchDetector(sampleRate, 2_048, 512);
  }

  process(inputs: Float32Array[][]): boolean {
    if (inputs.length === 0 || inputs[0].length === 0) {
      return true;
    }

    this.pitchDetector.process(
      inputs[0][0],
      (
        frequencyHz: number,
        clarity: number,
        midiNoteNumber: number,
        isTone: boolean,
      ) => {
        this.port.postMessage({
          frequencyHz,
          clarity,
          midiNoteNumber,
          isTone,
        });
      },
    );

    return true;
  }
}

registerProcessor('audio-worklet', Processor);
