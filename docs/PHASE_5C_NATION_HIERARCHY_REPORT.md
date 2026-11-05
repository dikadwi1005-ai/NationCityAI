# Phase 5C — National hierarchy and world presentation

The National Atlas opens eight separate regional scenes. It groups them under a national, provincial, district and local hierarchy across Pulau Aruna and Pulau Selatan. Regional navigation mounts one scene at a time. Detailed terrain is capped at 40, 64 or 96 chunks according to graphics quality. Distant terrain uses a coarser mesh.

The regional renderer shares the existing HUD and terrain engine. The capital has an Istana and ministries alongside high-rise commercial blocks. Provincial and regency capitals and cities have distinct offices. The village has narrower roads and farm plots. The coastal district has a bay, coastal vegetation and waterfront paths. The 23-asset catalog uses rotated multi-tile lots, setbacks, road envelopes, access paths and collision checks. Explore mode runs a local Chibi without creating a citizen record. Government office bindings identify the intended administrative level. They do not assign elected positions or provide platform administrator access.

Local time advances independently of server clocks. Dawn, noon, dusk and night presets can be selected and paused. Night changes the sky, residential destinations, windows, lamps and vehicle lights. High renders three 2048-pixel cascaded shadow maps. Medium uses one 1536-pixel map. Low omits dynamic shadows. Road scenes reuse meshes and materials. Parked vehicle geometry and the daylight light list were simplified after the first measurement.

Goat, Shiba, chicken, pigeon and seagull use skinned GLBs. The goat model has a project-authored rig. The pigeon and seagull models are original. The browser test verified changes in bone poses. Credits and licenses are in [the fauna manifest](../apps/web/public/models/fauna/LICENSE.md).

| View | Application screenshot |
| --- | --- |
| Original Pulau Harapan | [Pulau Harapan](nation-scope/pulau-harapan-final.jpg) |
| National Atlas | [Atlas](nation-scope/atlas-final.jpg) |
| National Capital | [Skyline](nation-scope/capital-final.jpg), [Istana](nation-scope/palace-final.jpg) |
| Provincial Capital | [Overview](nation-scope/province-final.jpg), [governor's office](nation-scope/governor-final.jpg) |
| Large City | [Metropolis](nation-scope/metropolis-final.jpg) |
| Medium City | [Overview](nation-scope/city-final.jpg), [mayor's office](nation-scope/mayor-final.jpg) |
| Regency Center | [Overview](nation-scope/regency-final.jpg), [regent's office](nation-scope/regent-final.jpg) |
| Subdistrict | [Subdistrict](nation-scope/subdistrict-final.jpg) |
| Rural Village | [Village](nation-scope/village-final.jpg), [goat](nation-scope/fauna-goat.jpg), [chicken](nation-scope/fauna-chicken.jpg) |
| Coastal District | [Coast](nation-scope/coast-final.jpg), [seagull](nation-scope/fauna-seagull.jpg) |
| Construction Lab | [Lab](nation-scope/construction-final.jpg), [construction frame](nation-scope/nation-construction-frame.jpg) |
| Street scale and lighting | [House](nation-scope/house-final.jpg), [Explore](nation-scope/explore-sandbox.jpg), [High shadows](nation-scope/capital-high-shadow.jpg), [night](nation-scope/capital-high-night.jpg) |

The original PNG captures and two local WebM recordings are in `docs/nation-scope`. `nation-regional-tour.webm` follows [the chapter list](nation-scope/tour-chapters.json). `day-night-transition.webm` records the running application as the clock advances. This capture uses Playwright and is separate from the deferred video generator feature.

## Validation and data

64 automated tests passed. Windows production build and isolated browser acceptance passed. The regression suites covered placement, citizens and multiplayer, proximity chat, government and voting, encrypted recovery, private S3 contract checks, PostgreSQL migration and the local PostgreSQL runtime. The S3 test used a stub. Physical mobile hardware and live cloud services remain outside this review.

The permanent SQLite file was audited read-only after drive D: returned on 6 November 2026. SQLite returned `ok`. All 25 table signatures matched the prior audit. The world held 32 objects at revision 0. Visual tests read a verified copy. Admin-approved demo saves go to the separate local sandbox database.

Development continued in the C: recovery checkout after source and dependency files on D: showed corruption. The source delivery comes from that checkout. The original database remains at its original D: path. Railway, AWS and paid AI services were left inactive. The changes are for draft review.
