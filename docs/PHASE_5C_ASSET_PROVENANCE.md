# Phase 5C asset provenance

All building, road, vehicle, vegetation and landscape geometry in `packages/world-engine/assets` and the related scene components is authored as original project code. Surface maps in `materials.ts` are generated deterministically by project code; no external image pack, game rip or paid asset is included. Demo City uses these same renderers.

The sky uses Three.js's analytic `Sky` helper and a locally generated PMREM environment, not a downloaded HDR photograph. Three.js and its examples are MIT licensed; see `node_modules/three/LICENSE`. React Three Drei is MIT licensed; see `node_modules/@react-three/drei/LICENSE`. Dependency notices remain with their packages and lockfile.

Original project work remains subject to the repository owner's licensing decisions. This document does not grant a new CC0 or other blanket license to project assets. No third-party art attribution or redistribution license is required for an external asset pack because none was used in this pass.

PNG and WebM evidence under `docs/phase-5c/pass3` is captured from the running application. It is not generated concept art or a replacement for renderer implementation.
