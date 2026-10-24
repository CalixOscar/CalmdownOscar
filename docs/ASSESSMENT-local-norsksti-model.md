# Optional local practice helper for Norsksti

Assessed 24 October 2026. This is a proposal, not an implemented or evaluated AI feature.

## Recommendation

Keep the PDFs and teacher-reviewed answer keys as the course foundation. A downloadable model could be useful as an optional practice helper after a separate planned and evaluated prototype. Do not add a model download, cloud dependency or account requirement to opening a worksheet.

Useful first tasks are hints on a selected exercise, short explanations of course vocabulary, and simple role-play using the current lesson. Use the selected page text and approved answer explanation as context, rather than asking the model to invent a curriculum. Start with text only. A model does not replace the missing original CD audio or establish pronunciation-assessment quality.

## Device and download trade-offs

WebLLM runs inference in the browser using WebGPU and supports web workers. Model files are downloaded before use; actual download size, memory use, load time and speed must be measured for the selected model on learners’ devices. No model has been downloaded or benchmarked in this assessment. Capability detection, an explicit download with a size estimate and cancellation, cache management, and an unsupported-device fallback are prerequisites. The course must remain usable when a model cannot load or browser storage is cleared.

A desktop local-model app is another possible experiment but adds installation and browser-to-localhost integration. It is not the first choice for a phone/tablet course. Do not loosen the site’s connection policy or add a backend as part of the current visual changes.

## Quality and boundaries

Evaluate Norwegian Bokmål correctness and genuinely beginner-level explanations with Peter before selecting a model. Test course vocabulary, inflection, word order, valid alternate answers, incorrect premises, unanswerable prompts and attempts to expose the answer immediately. Teacher-approved keys remain authoritative. Model suggestions must never mark work approved, release another course, edit shared keys, change the roster, or receive student contact details. Keep any proposed chat limited to practice and label its fallibility.

Before building, follow the studio AI-feature planning and independent review process. Compare a small multilingual model against a larger candidate supported by the chosen runtime; parameter count alone is not evidence of Norwegian teaching quality. Verify model license, exact artifact sizes and current browser support at selection time. Do not call any model the best fit before testing it.

## Acceptance for a later prototype

- Peter approves a representative set of A1 lesson hints and dialogues, including failure cases.
- Record device/browser, cold download bytes, time to first reply, memory or failure behavior, and offline repeat use.
- The PDF, normal exercises and manual approval workflow work without the helper.
- The helper is opt-in, cancellable and removable; teacher decisions remain unchanged.

## Primary sources

- WebLLM documentation: https://webllm.mlc.ai/docs/ — in-browser inference, WebGPU and worker support.
- Google AI Edge web guide: https://developers.google.com/edge/mediapipe/solutions/genai/llm_inference/web_js — on-device inference and WebGPU requirement; currently recommends LiteRT-LM JavaScript for new work because the older MediaPipe API is maintenance-only.
