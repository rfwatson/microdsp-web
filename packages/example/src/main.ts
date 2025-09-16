import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import 'bootstrap/scss/bootstrap.scss';
import './style.scss';
import { fetchWasm } from '@rfwatson/microdsp-web';
import workletUrl from './worklet.js?worker&url';

interface Elements {
  startButton: HTMLButtonElement;
  status: HTMLElement;
  pitch: HTMLElement;
  clarity: HTMLElement;
  framesProcessed: HTMLElement;
  select: HTMLSelectElement;
  rangeContainer: HTMLSpanElement;
  range: HTMLInputElement;
  rangeLabel: HTMLLabelElement;
}

interface Nodes {
  worklet: AudioWorkletNode;
  gain: GainNode;
  oscillator: OscillatorNode;
}

class Example {
  private readonly el: Elements;
  private readonly nodes: Nodes;
  private readonly audioContext: AudioContext;
  private source: MediaStreamAudioSourceNode | null = null;
  private framesProcessed: number = 0;
  private lastReceivedToneAt: Date | null = null;

  constructor(
    audioContext: AudioContext,
    elements: Elements,
    moduleBytes: ArrayBuffer | Uint8Array,
  ) {
    this.el = elements;

    // Web audio graph
    this.audioContext = audioContext;
    this.audioContext.addEventListener(
      'statechange',
      this.handleAudioContextStateChange,
    );

    this.nodes = this.buildNodes(moduleBytes);

    // Event handlers
    this.bindEventHandlers();
  }

  async tryUserMedia() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.source = this.audioContext.createMediaStreamSource(stream);
      this.source.connect(this.nodes.worklet);
    } catch {
      console.warn('Microphone not available');
      this.el.select.value = 'tone';
      this.el.select.disabled = true;

      this.enableTone();
    }
  }

  private buildNodes(moduleBytes: ArrayBuffer | Uint8Array): Nodes {
    const gain = this.audioContext.createGain();
    gain.gain.value = 0.7;
    gain.connect(this.audioContext.destination);

    const oscillator = this.audioContext.createOscillator();
    oscillator.frequency.value = 440;
    oscillator.type = 'sine';

    const worklet = new AudioWorkletNode(this.audioContext, 'audio-worklet', {
      processorOptions: { moduleBytes },
    });
    worklet.port.onmessage = this.handleWorkletMessage;

    return {
      worklet,
      gain,
      oscillator,
    };
  }

  private bindEventHandlers() {
    this.el.select.addEventListener('change', this.handleSelectChange);
    this.el.startButton.addEventListener('click', this.handleStartButtonClick);
    this.el.range.addEventListener('input', this.handleFreqChanged);
  }

  private handleAudioContextStateChange = () => {
    console.log(`AudioContext state changed to: ${this.audioContext.state}`);
    if (this.audioContext.state === 'running') {
      this.el.status.textContent = 'running';
      this.el.startButton.textContent = 'Pause';
      this.el.status.classList.remove('bg-secondary');
      this.el.status.classList.add('bg-success');
      this.el.startButton.classList.add('btn-secondary');
      this.el.startButton.classList.remove('btn-success');
    } else {
      this.el.status.textContent = 'paused';
      this.el.startButton.textContent = 'Run';
      this.el.status.classList.remove('bg-success');
      this.el.status.classList.add('bg-secondary');
      this.el.startButton.classList.add('btn-success');
      this.el.startButton.classList.remove('btn-secondary');
      this.el.pitch.textContent = '-';
    }
  };

  private handleSelectChange = async () => {
    if (this.el.select.value === 'mic') {
      this.enableMic();
    } else {
      this.enableTone();
    }
  };

  private handleStartButtonClick = () => {
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
      this.el.startButton.classList.add('btn-secondary');
      this.el.startButton.classList.remove('btn-success');
    } else {
      this.audioContext.suspend();
      this.el.startButton.classList.add('btn-success');
      this.el.startButton.classList.remove('btn-secondary');
    }
  };

  private handleFreqChanged = () => {
    this.nodes.oscillator.frequency.value = Number(this.el.range.value);
    this.el.rangeLabel.textContent = `${this.el.range.value} Hz`;
  };

  private handleWorkletMessage = (event: MessageEvent) => {
    if (this.audioContext.state === 'suspended') {
      return;
    }

    this.framesProcessed += 1;
    this.el.framesProcessed.textContent = this.framesProcessed.toString();

    const { frequencyHz, clarity, isTone } = event.data;

    if (isTone) {
      this.el.pitch.innerHTML = `<span class="badge bg-secondary">${frequencyHz.toFixed(2)} Hz<span>`;
      this.el.clarity.textContent = clarity.toFixed(2);
      this.lastReceivedToneAt = new Date();
      return;
    }

    // If we have a recently identified tone, don't clear the display yet.
    const hasRecentTone =
      this.lastReceivedToneAt &&
      Date.now() - this.lastReceivedToneAt.getTime() < 1_000;
    if (hasRecentTone) {
      return;
    }

    this.el.pitch.textContent = '-';
    this.el.clarity.textContent = '-';
  };

  private enableTone() {
    if (this.source) {
      this.source.disconnect();
    }

    this.nodes.oscillator.connect(this.nodes.worklet);
    this.nodes.oscillator.connect(this.nodes.gain);
    this.nodes.oscillator.start();

    this.el.rangeContainer.classList.remove('d-none');
    this.el.rangeContainer.classList.add('d-inline');
  }

  private enableMic() {
    if (!this.source) {
      return;
    }

    this.nodes.oscillator.disconnect();
    this.source.connect(this.nodes.worklet);

    this.el.rangeContainer.classList.remove('d-inline');
    this.el.rangeContainer.classList.add('d-none');
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const startButton = document.getElementById(
    'start-button',
  ) as HTMLButtonElement;
  const statusEl = document.querySelector('#status .badge') as HTMLElement;
  const pitchEl = document.getElementById('pitch') as HTMLElement;
  const clarityEl = document.getElementById('clarity') as HTMLElement;
  const framesProcessedEl = document.getElementById('frames-processed');
  const selectEl = document.getElementById('input-select') as HTMLSelectElement;
  const rangeContainerEl = document.getElementById(
    'range-container',
  ) as HTMLSpanElement;
  const rangeEl = document.getElementById('freq-range') as HTMLInputElement;
  const rangeLabelEl = document.querySelector(
    'label[for="freq-range"]',
  ) as HTMLLabelElement;
  if (
    !startButton ||
    !statusEl ||
    !pitchEl ||
    !clarityEl ||
    !framesProcessedEl ||
    !selectEl ||
    !rangeEl
  ) {
    throw new Error('Element not found');
  }
  selectEl.value = 'mic';

  const audioContext = new AudioContext();
  await audioContext.audioWorklet.addModule(workletUrl);

  const moduleBytes = await fetchWasm();
  const example = new Example(
    audioContext,
    {
      startButton,
      status: statusEl,
      pitch: pitchEl,
      clarity: clarityEl,
      framesProcessed: framesProcessedEl,
      select: selectEl,
      rangeContainer: rangeContainerEl,
      range: rangeEl,
      rangeLabel: rangeLabelEl,
    },
    moduleBytes,
  );
  example.tryUserMedia();
  document.documentElement.setAttribute('data-app-ready', 'true');
});
