# Phase 6 — Local regional planning

Open `/nation-construction` from the National Atlas. The planner matches 13 Indonesian command examples to deterministic rules for region type and intent. Supported examples include a national capital, provincial government center, metropolis, regency growth, coastal village and medium-density housing. The local rules sample dry and steep terrain, lay out roads, evaluate access and setbacks, and place zoned lots from the regional catalog. Existing records keep their IDs and coordinates during supported expansion.

The lab starts with a proposal. Approval starts a local simulation with survey, marking, foundation, framing and finishing jobs. Dependencies gate progress. Completed results can be saved through the authenticated sandbox endpoint. Undo restores the previous snapshot. Sandbox writes are separate from permanent citizens, chat, elections and world data. The planner has no model API dependency and operates on a supported command vocabulary.

Browser acceptance verified proposal and approval, an intermediate construction frame, completion, an authenticated save and exact undo. The unit suite tests each command against terrain and lot rules and verifies deterministic output and construction dependencies. The expansion and transport tests check that existing building records survive.

| Evidence | Application capture |
| --- | --- |
| Proposed plan | [Preview](nation-scope/nation-planner-preview.jpg) |
| Intermediate build | [Frame](nation-scope/nation-construction-frame.jpg) |
| Completed build | [Completion](nation-scope/nation-construction-complete.jpg) |
| Browser results | [Acceptance log](nation-scope/nation-planner-acceptance.json) |

The sandbox stays local. Road and parcel generation uses rules for these fixture terrains. The preview does not validate real-world planning regulations or perform a production migration.
