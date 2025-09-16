import wasmUrl from '../wasm/main_bg.wasm?url';
import init, { initSync } from '../wasm/main';
export { MpmPitchDetector } from '../wasm/main';

// Helper method to fetch the WASM binary.
export async function fetchWasm() {
  const resp = await fetch(wasmUrl);
  return new Uint8Array(await resp.arrayBuffer());
}

// Helper method to initialize the WASM module.
export async function initWasm() {
  return init(wasmUrl);
}

// Helper method to synchronously initialize the WASM module.
export function initWasmSync(bytes: ArrayBuffer | Uint8Array) {
  return initSync(bytes);
}
