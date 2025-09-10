pub use microdsp::mpm::{MpmPitchDetector, MpmPitchResult};
use wasm_bindgen::prelude::*;
use wasm_bindgen_futures::js_sys;

#[wasm_bindgen]
pub struct WasmPitchDetector(MpmPitchDetector);

#[wasm_bindgen]
impl WasmPitchDetector {
    #[wasm_bindgen(constructor)]
    pub fn new(sample_rate: f32, window_size: usize, hop_size: usize) -> Self {
        Self(MpmPitchDetector::new(sample_rate, window_size, hop_size))
    }

    #[wasm_bindgen]
    pub fn process(&mut self, buffer: &[f32], callback: &js_sys::Function) {
        self.0.process(buffer, |res| {
            callback
                .call4(
                    &JsValue::NULL,
                    &JsValue::from_f64(res.frequency as f64),
                    &JsValue::from_f64(res.clarity as f64),
                    &JsValue::from_f64(res.midi_note_number as f64),
                    &JsValue::from_bool(res.is_tone()),
                )
                .unwrap();
        });
    }
}
