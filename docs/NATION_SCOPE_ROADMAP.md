# Nation scope correction — acceptance roadmap

Baseline: PR #3 `db3e0f4fba3bf2925d8a9906b1dace506e8b7890`. Earlier Phase 5C/6 work is retained. New branch: `review/nation-hierarchy-20261105`. A pre-change Git checkpoint and encrypted backup/restore comparison protect the existing 25 tables, 32 objects and revision 0.

This roadmap supersedes the single-island demonstration direction. Intermediate checkpoints are not final acceptance.

| Stage | Required implementation | Status |
| --- | --- | --- |
| A | Administrative country tree, boundaries, national atlas, independent region scenes and explicit loading/unloading | Verified: production build, hierarchy tests, native Edge atlas → capital → village navigation; one active region and 64 Medium detail chunks. Screenshots are intermediate technical evidence, not final visual acceptance. |
| B | Versioned multi-tile sandbox assets, zoning/setbacks, collision/preview/picking and separate persistent state with approval/audit/undo | 53 unit/regression tests and production build pass. Separate sandbox API, real preview and triangle picking integrated; native Edge picking, authenticated save, reload persistence, exact-ID undo, invalid placement preview and local Explore movement pass. |
| C | Distinct national/provincial/regency/city/subdistrict/village government assets, modern skyline and LOD | Original architectural kit, 23 catalog types, distinct office hierarchy bindings, real facade geometry, merged picking batches, camera-distance LOD and local Explore are implemented. Three architecture/government/routing tests pass; final lighting/evidence review remains Stage G. |
| D | Functional local clock, sun/sky/moon/stars, real night lighting/activity and High shadow improvement | Native Edge presets, exact pause, automatic time advance, local night schedules, real street/vehicle lighting and Low/Medium/High shadow transitions pass. High uses 3×2048 camera-following CSM; a real day/night WebM is recorded. |
| E | Recognizable original animated animal assets with anatomy, rig, clips, habitat and LOD | Five anatomical GLBs: licensed Google goat with original 13-bone rig, Quaternius Shiba/chicken, and two original lofted feather-wing birds. Native Edge confirms actual bone-pose changes; final close-ups show the animals. Habitat/quality caps, distance culling, grazing/pecking/flight/perch transitions and license manifest are included. |
| F | Deterministic terrain/zoning/roads/asset planning, construction, approval and reversible execution | All ten commands produce terrain-tested roads/zoning/assets. Growth adds outer roads/lots while retaining existing IDs. Survey/marking/foundation/frame/finish are real scene stages. Native Edge preview→local approval→construction→authenticated sandbox save→exact undo passes. Permanent targets remain unavailable. |
| G | Performance, Phase 1–6 regressions, screenshots of every region and day/night video, draft PR | Pending |

Final evidence must show National Atlas, National Capital, Provincial Capital, Large City, medium city/regency center, subdistrict, Rural Village, Coastal District and Construction Lab. Each scene has independent geography/composition and only the active scene is rendered. Government authority stays separate from platform administrator permission. No fixture import into the permanent world, paid service, merge or full video-generator activation.

Reports: `docs/PHASE_5C_NATION_HIERARCHY_REPORT.md` and `docs/PHASE_6_LOCAL_PLANNING_REPORT.md`. A feature is accepted only after real application evidence and functional tests exist; no placeholder or static mockup is counted as completion.


Workstation recovery: several D: source/dependency files became corrupt after the Stage A checkpoint. Development continues in the verified C: recovery checkout. All original database signatures still match (25 tables, 32 objects, revision 0). Five corrupted recovery working-tree files were restored byte-for-byte from healthy Git objects; latest multi-tile changes were preserved. No permanent database was recreated.
