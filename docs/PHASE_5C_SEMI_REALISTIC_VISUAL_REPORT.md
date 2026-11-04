# Phase 5C Quality Pass 3 — semi-realistic direction

This report tracks stages individually; Stage A alone does not complete Pass 3.

## Source and data safety

Basis: PR #2 head `ce3f3de5aac810b37a2fe8ae22ddab4ddcf7ff78`. A pre-Pass-3 Git checkpoint and consistent encrypted backup were created. Restore to a separate temporary file matched all 25 table signatures. Source remains revision 0 with 32 original objects. No fixture import, server-coordinate/footprint/collision migration, backend rewrite, paid provisioning, production deployment, merge or Phase 6 is authorized/performed.

## Stage A — visual foundation

- Shared Low/Medium/High configuration changes actual pixel ratio, shadows, terrain resolution, vegetation limit and material-map workload. Existing lightweight toggle remains compatible.
- Original deterministic procedural surface maps (color/roughness/normal/dirt-occlusion) and a reusable PBR material cache. Static batch compilation now retains consistent world-space UV/UV1 attributes; previously UVs were discarded.
- Procedural sky environment for reflections, restrained environment fill, sunlight, hemisphere fill, soft shadow, ACES and subtle distance haze. No downloaded HDR/art assets.
- Perspective camera with smooth pan/zoom/orbit/focus; City Overview, Neighborhood and Street controls augment existing nation overview and Explore. Touch uses one-finger pan and two-finger zoom/orbit.
- Rendering-scale adapter: **one legacy domain unit represents 3 visual meters**. A 2×2 legacy house footprint becomes a 6×6 m visual lot, a two-unit road becomes 6 m, and Chibi world height becomes approximately 1.7 m. Catalog labels explicitly say visual meters. Stored numbers/commands/collision are unchanged.
- The server citizen collider retains its legacy personal-space envelope and does not shrink with the Chibi mesh. This is a presentation adapter, not a claim of a physically migrated meter-accurate simulation. The starter island remains geographically small; no rescaling of saved geography hides that limitation.
- Stage-A production build/typecheck and Edge quality/resource-cycle checks pass. Raw measurements and screenshots are in `docs/phase-5c/pass3/stage-a-verification.json`. Initial High was too pale and about 54 FPS, so environment intensity, shadow size and pixel cost were corrected before checkpointing.

## Pending stages

B: modular architecture/asset registry and geometric residential diversity; C: district composition and roads/urban detail; D: tropical vegetation/terrain/coast; E: vehicle/NPC integration; F: final review, all-world benchmarks, resource soak, regressions and GitHub publication. Do not interpret the current foundation as completion of these stages.

## Asset provenance

Procedural maps and model geometry authored in this repository are original project assets. No game-reference assets were copied. Three.js/drei/React and other dependency code retain their upstream package licenses. No paid asset packs, cloud services, remote texture downloads or AI-generated fake implementation screenshots are used.

## Stage B — architecture checkpoint

Eight residential envelopes now have real geometry differences: tropical veranda, courtyard, duplex, townhouse, carport, balcony, garden bungalow and split roof. Building modules/primitives/registry replace the monolithic model file. Doors/windows/floors follow the visual-scale adapter; original footprint and server data are retained. Government/healthcare facades, entrance and roof/service details are replaced. Material kinds select plaster, stone, glass, timber, tile and metal surfaces. Low omits detail meshes; High adds trim/mullions. Stage-B typecheck/build and native Edge quality/resource-cycle checks pass with no page/GPU errors; sampled Medium ~90 FPS and High ~64 FPS. This does not complete districts/nature/traffic polish.
