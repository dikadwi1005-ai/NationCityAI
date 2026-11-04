# Phase 5C Quality Pass 3 — semi-realistic visual review

Implementation stages A–F are prepared for owner art review. This is a browser game visual pass; owner acceptance of the final art direction remains pending. No merge, production deployment, paid Railway/AWS activation or Phase 6 was performed.

## Source and checkpoints

Based on PR #2 head `ce3f3de5aac810b37a2fe8ae22ddab4ddcf7ff78`, stacked on the Phase 5B release branch used by PR #1. The pre-Pass-3 checkpoint remains available. Each stage has a runnable production build/typecheck and native Edge evidence. Public checkpoint trees are compared with their local Git trees before publication.

| Stage | Delivered scope | Checkpoint branch |
| --- | --- | --- |
| A | PBR, natural lighting, perspective camera, quality presets, scale adapter | checkpoint/pass3-stage-a-20261104 |
| B | Eight geometric house archetypes, modular assets, hall and clinic | checkpoint/pass3-stage-b-20261104 |
| C | Five districts, urban roads, fixture-only public/commercial assets | checkpoint/pass3-stage-c-20261104 |
| D | Tropical foliage, terrain, filtered coast, depth-colored sea | checkpoint/pass3-stage-d-20261104 |
| E | Vehicles, headway/braking/turns, Chibi animation and shading | checkpoint/pass3-stage-e-20261104 |
| F | Camera/door/foliage fixes, resource cleanup, avatar LOD, native-resolution Medium, evidence and regressions | checkpoint/pass3-stage-f-20261105 |

Stage A–E screenshots and raw JSON remain in `docs/phase-5c/pass3/stage-*-*`. Historical Pass 2 evidence is preserved separately.

## World, assets and scale

Eight residential envelopes have distinct geometry: tropical veranda, courtyard, duplex, townhouse, carport, balcony, garden bungalow and split roof. Real geometry supplies doors, window frames, side facades, roof/gutter details, terraces, balconies, fences, garden props and exterior lights. The government landmark has an entrance, pillars, stairs and a civic plaza; the clinic has a canopy, roof equipment and modern glazing.

Demo City has **266 domain objects plus 7 presentation-only public/commercial fixtures**, organized into residential, government, commercial, waterfront and green districts. Shops, shophouses, cafes, service/recreation buildings and parking remain clearly fixture-only. The main build catalog still contains six domain assets. Fixture picking shows a read-only notice, and local routing/placement respects fixture bounds. No demo object/account/statistic is inserted into the permanent source. Reload resets demo edits; the visible return link opens the permanent world without copying data.

One legacy domain unit represents **3 visual meters**. A two-unit house lot and road span 6 visual meters; Chibi is about 1.7 m tall and a car about 4.05 m long. Stored IDs, coordinates, footprints, terrain and server collision are unchanged. The server avatar personal-space envelope and gameplay distances retain legacy units. This is a presentation adapter, not a physical-unit database migration. The starter island remains small and undeveloped.

Road meshes infer straight, corner, T and four-way connections from real tiles. Main avenues and side streets differ visually within existing footprints. Curbs, sidewalks, crossings, markings, drains, streetlights and planting are 3D. Traffic uses connected road tiles and continuous lane curves, with acceleration, braking, length-aware spacing and basic intersection reservations. It is a decorative simulation, with no guarantee of physically accurate turning radii or deadlock-free traffic.

## Materials and natural environment

Original deterministic maps provide plaster, concrete, asphalt, glass, timber, tile, metal, soil, grass, sand and stone surfaces. Medium uses color/roughness maps; High adds normal/dirt-occlusion detail. Shared material batches retain world-space UV/UV1 and per-object triangle ranges for picking. Glass uses environment reflection; no SSR, ray tracing or full transparency simulation is claimed.

Analytic sky, PMREM reflections, sunlight, hemisphere fill, soft shadows, ACES and distance haze replace flat illumination. Broadleaf, shade trees and palms use shared leaf/frond geometry and instancing; grass, shrubs and rocks avoid built footprints. Terrain normals are welded/smoothed and the coast has a continuous render filter. A bounded depth/coast-distance field drives sea color and shore foam. None of this modifies saved geography. Large Atlas extents would require regional coast-field streaming.

Low/Medium/High change actual geometry detail, vegetation caps, maps, shadows and pixel workload. Final DPR budgets are 1 / 1 / 1.2, shadows 0 / 1536 / 2048, vegetation caps 48 / 140 / 240. Mobile starts at Low with at most 5 NPC and 2 vehicles. Chibi retains its creator identity and full close-up face detail; distant views omit subpixel face meshes with hysteresis. Fixed palette materials are bounded/shared; selected colors are owned and disposed per avatar. The superseded Environment module is removed.

## Data protection and regression

A consistent encrypted backup was made before Pass 3, restored into a separate temporary file and compared across all 25 tables. The actual permanent `data/nation.sqlite` still has **25 tables, 32 original objects, revision 0**. All table signatures match the pre-pass audit; integrity is OK, foreign-key violations are zero and migrations [1,2,5] are present. Private database, backup, recovery key, operator records and environment files are excluded from Git.

All 29 checked backend/API/deployment files match the pre-pass source. Auth, government, elections, chat, persistence and Phase 5B Railway/PostgreSQL/private-S3 preparation are preserved.

Validation: 42 unit/domain tests; typecheck and production build; placement/terrain/undo/redo/restart; fullscreen/catalog/selection/rotation/movement; Living World routing and controls; two-account creator with repeated palette changes, touch movement, travel and reconnect; proximity chat; government/elections; native PostgreSQL 18.6 TCP import/runtime/second-database restore and local HTTPS/WSS; recovery/backup corruption tests; PostgreSQL migration/RLS; S3 stub protocol contract. Avatar changes were rechecked with creator/multiplayer and final visual/resource tests. Raw results: `regression-verification.json`, `final-verification.json`, `mobile-verification.json`, `live-verification.json` and `data-safety-verification.json` in the Pass 3 evidence folder.

S3 contract tests use a stub. No real S3 bucket upload/download/restore or Railway public deployment was tested.

Publication integrity: a local npm certificate module failed parsing and a Git object failed decompression. The npm package was restored from a lockfile-SHA512-verified archive, and affected tests passed on rerun. Publication uses a separate fresh checkout verified with git fsck; the old checkout is retained. Five historical stage PNGs differed from checkpoint blobs and were restored from the verified Stage E Git history. Final source/evidence hashes are checked again before updating the PR. No cause is inferred for these local file failures. The release-overlay helper accepts an explicit checkout path and keeps its private-file exclusion policy.

## Measured performance

Native Edge 156 on AMD Radeon integrated desktop graphics, CSS viewport 1600×1000, City Overview, 10 NPC / 4 vehicles, three short samples per quality. Both actual permanent world and Demo City use the same settings. DPR changes drawing-buffer size and is recorded in raw samples. These are measurements on this machine, not hardware-class guarantees.

| Runtime | Quality | FPS samples | Draw calls | DPR |
| --- | --- | --- | --- | --- |
| permanent | low | 90 / 90 / 90 | 295 | 1 |
| permanent | medium | 90 / 90 / 90 | 351 | 1 |
| permanent | high | 90 / 91 / 90 | 353 | 1.2 |
| demo | low | 90 / 90 / 90 | 375 | 1 |
| demo | medium | 78 / 77 / 64 | 433 | 1 |
| demo | high | 72 / 68 / 69 | 435 | 1.2 |

The isolated acceptance benchmark is also retained separately. Before optimization, Demo Medium used 593 calls with samples 52/49/45 FPS; avatar LOD reduced it to 433 calls but still yielded 46/48/49 FPS at DPR 1.25. This motivated native-resolution Medium. Both earlier runs are retained as `pre-optimization-verification.json` and `pre-resolution-verification.json`; the final measurements above are not substituted with the better historical Stage E numbers.

In the isolated final run, Demo Medium measured 69 / 73 / 73 FPS; High included 43 / 66 / 73 FPS, so High is not guaranteed to stay above 60 FPS. Warm/settled resources were 164/164 geometries and 39/39 textures. Retained heap grew by about 1.16 MiB after bounded cycles, below the 30 MB assertion limit. Fresh mobile emulation measured 86 / 90 / 90 FPS and 221–234 draw calls, with one GPU texture and no surface texture sets in fresh Low.

Short quality/density/catalog cycles are not proof of an unlimited-session memory-leak-free application. The resource checks include settling/GC and compare the same warm settings. Physical phones, long-duration soak and nationwide population/terrain scale remain untested. Mobile evidence is fresh 390×844 touch emulation on the desktop GPU, with actual pinch and one-finger pan; it does not certify physical-phone FPS.

## Actual application evidence

| Requested view | File under docs/phase-5c/pass3 |
| --- | --- |
| Actual permanent Pulau Harapan | harapan-live.png |
| Demo overview | demo-overview-final.png |
| Residential district | residential-district.png |
| Government district | government-district.png |
| Commercial district | commercial-district.png |
| Waterfront / coast and sea | waterfront-district.png |
| House close-up | house-semi-realistic-close.png |
| Government hall close-up | hall-semi-realistic-close.png |
| Roads and intersection | road-intersection-final.png |
| NPC and vehicle activity | npc-traffic-activity.png |
| Street-level camera | street-camera.png |
| Fresh mobile Low | mobile-low-final.png |

Additional green-district and context captures are included. `harapan-final-fixture.png` is explicitly the isolated seed fixture and is not presented as the actual permanent database screenshot. `gameplay-camera-npc-traffic.webm` records about 8.5 seconds of the running WebGL canvas with real zoom/orbit, pedestrians and traffic; PNGs and WebM are not generated mockups.

## Review and remaining limits

Open local permanent world at http://localhost:3000 and fixture at http://localhost:3000/demo-city. Keep the existing HUD. Use Settings for quality/camera/district presets and object selection for Building Focus. Return from demo with the banner link.

Review the supplied images/video before declaring Phase 5C's art direction accepted. Procedural architecture and surface maps remain a constrained semi-realistic browser presentation, not production photorealism. Legacy grid widths constrain roads, lot size and turning space; the starter has only its original 32 objects. Decorative traffic/NPCs are client-local. The source geography and collision can differ slightly from coast smoothing. Physical mobile, long soak, full accessibility and real private-S3/public hosted acceptance remain outstanding.

See `docs/PHASE_5C_ASSET_PROVENANCE.md` for asset provenance and dependency licenses. No external game art, paid asset pack or downloaded HDR was used. PR #2 remains draft for owner review; no merge or paid deployment is approved.
