# MASTER PROJECT: AI NATION BUILDER
## Persistent Multiplayer Nation Simulation, Community Government, Spatial Chat & Automatic Video Studio

You are Astra, acting as the lead software architect, senior full-stack engineer, multiplayer game developer, 3D technical artist, AI systems engineer, and video rendering engineer.

Build a real, functional, production-oriented browser-based multiplayer nation simulation game called **AI Nation Builder**.

This is a long-term project. Prioritize working systems, persistent data, actual multiplayer synchronization, authentic 3D rendering, and maintainable architecture.

Do not build a static website that only resembles a game.

Do not implement fake buttons, simulated multiplayer, fake AI responses, or placeholder video rendering and describe them as working functionality.

All branding, characters, game assets, and visual designs must be original.

---

# 1. PROJECT VISION

AI Nation Builder is an interactive fictional nation controlled and developed by its online community.

The nation exists as a persistent 3D world.

Players can register as virtual citizens, create chibi characters, explore regions, communicate with nearby players, participate in elections, become elected officials, submit development proposals, and watch national construction projects occur in real time.

The administrator can manually build infrastructure, use AI to generate construction plans, expand the country's geography, manage elections, and automatically generate cinematic social media videos from actual in-game events.

The nation must persist indefinitely across sessions and episodes.

## Core Principles

1. One persistent fictional nation.
2. A fully customizable and expandable world map.
3. Original stylized low-poly 3D visuals.
4. Chibi / miniature player characters.
5. Real online multiplayer.
6. Location-based proximity chat.
7. Community-driven elections.
8. Hierarchical virtual government.
9. Manual and AI-assisted construction.
10. Real-time world construction events.
11. Automatic cinematic video generation.
12. Permanent world and character history.
13. Secure accounts, moderation, and role permissions.
14. Scalable architecture.

The final product must function as both:
- A multiplayer nation simulation game.
- A community-driven content production platform.

---

# 2. TECHNOLOGY ARCHITECTURE

Use the following preferred stack unless a technically justified alternative is necessary.

## Frontend
- Next.js.
- React.
- TypeScript.
- Tailwind CSS.
- React Three Fiber.
- Three.js.
- Zustand for local editor state.

## Multiplayer Backend
- Node.js.
- Colyseus for authoritative multiplayer rooms.
- WebSockets for real-time state synchronization.
- Spatial interest management.
- Client interpolation and appropriate movement validation.

## Database
- Supabase PostgreSQL.
- Supabase Auth.
- Supabase Storage.
- PostgreSQL Row Level Security.
- Database migrations.

## Background Processing
- Redis.
- BullMQ.
- Dedicated worker processes.

## Video Production
- Remotion.
- @remotion/three.
- FFmpeg.
- Frame-based deterministic animation.
- Server-side rendering workers.

## Artificial Intelligence
- Server-side LLM integration.
- Structured output schemas.
- Validated tool/command execution.
- AI world planning.
- AI construction planning.
- AI-generated episode scripts and storyboards.

## Audio
- Configurable text-to-speech provider.
- Reusable voice profiles.
- Subtitle generation.
- Sound effects and audio mixing.

## Deployment

Separate the web frontend, multiplayer server, and rendering workers.

Do not assume that stateless serverless functions can maintain long-lived multiplayer rooms.

Use containerized services where appropriate.

Support local development with Docker Compose.

All external services must be configurable through environment variables.

---

# 3. NATIONAL WORLD ENGINE

The game must represent an entire fictional country rather than a single city or village.

## World Structure

The world must support:
- Country.
- Islands.
- Provinces.
- Regencies.
- Cities.
- Districts.
- Villages.
- Urban subdistricts.
- Neighborhood associations (RW).
- Neighborhood units (RT).
- Mountains.
- Rivers.
- Lakes.
- Beaches.
- Forests.
- Agricultural areas.
- Urban settlements.
- Industrial zones.
- Transportation infrastructure.

Use a hierarchical administrative region system.

Every administrative region must have a persistent ID, type, name, parent region, boundary geometry, and metadata.

Never hardcode a fixed number of provinces, cities, or islands.

## Three Levels of World Visualization

### National View
Display the full country. Show islands, provincial boundaries, cities, major infrastructure, and geographic features. Use low-detail terrain and simplified representations.

### Regional View
Display provinces, regencies, cities, roads, development zones, and regional infrastructure. Allow players to zoom into administrative regions.

### Local View
Display actual detailed 3D terrain, buildings, roads, vehicles, NPCs, and player characters. This is the primary multiplayer interaction view.

All three levels must use the same authoritative world data.

---

# 4. CUSTOM EXPANDABLE WORLD MAP

Build a fully functional 3D World Map Editor.

The administrator must be able to modify the country's geography.

## Required Tools
- Create island.
- Create new landmass.
- Expand existing island.
- Edit coastline.
- Sculpt terrain.
- Raise mountains.
- Lower terrain.
- Create rivers.
- Create lakes.
- Create forests.
- Paint terrain materials.
- Define administrative boundaries.
- Create and rename provinces.
- Subdivide administrative regions.
- Create roads and bridges.
- Add new cities and settlements.
- Create ports and airports.
- Remove or modify approved geographic features.

## Terrain Architecture

Use chunk-based terrain generation.

Each terrain chunk must have:
- Stable coordinates.
- Unique ID.
- Height and surface data.
- Biome information.
- Asset placement data.
- Version history.

Use deterministic procedural generation.

Adding new terrain must not regenerate or destroy existing regions.

Load only relevant chunks near the player or camera.

Implement level-of-detail techniques for large national views.

## AI World Expansion

The administrator must be able to enter instructions such as:

"Create a new tropical island north of the main island. Add mountains, forests, a river, and a suitable location for a provincial capital."

The AI must:
1. Analyze existing geography.
2. Generate structured terrain operations.
3. Identify valid expansion coordinates.
4. Preview the proposed world changes.
5. Validate boundaries and conflicts.
6. Require administrator approval.
7. Apply the approved changes.
8. Save the updated world version.
9. Broadcast the changes to connected players.
10. Record the event for automatic video production.

Never permit AI to directly modify world data without validation and authorization.

---

# 5. MANUAL CONSTRUCTION SYSTEM

Create an interactive 3D construction editor.

Administrative users must be able to:
- Select buildings.
- Place objects.
- Move objects.
- Rotate buildings.
- Delete authorized objects.
- Create roads.
- Build bridges.
- Create airports.
- Construct seaports.
- Place public facilities.
- Add vegetation.
- Create residential areas.
- Develop industrial regions.

Required editor systems:
- Grid snapping.
- Object selection.
- Transform controls.
- Collision detection.
- Terrain suitability checks.
- Undo and redo.
- Autosave.
- Construction previews.
- Persistent building IDs.
- Building ownership and region associations.

Manual construction must operate through the same validated command system used by AI construction.

---

# 6. AI CONSTRUCTION BUILDER

Implement an AI-powered national development planner.

Example instruction:
"Build an international airport in the eastern province, including an aircraft runway, terminal, control tower, parking area, and connecting highway."

The AI must:
1. Read current world state.
2. Identify the target province.
3. Analyze available land.
4. Select existing assets from the asset library.
5. Produce structured construction commands.
6. Validate coordinates and collisions.
7. Validate permission requirements.
8. Preview the proposal.
9. Wait for administrator approval.
10. Apply approved commands.
11. Create a persistent construction event.
12. Synchronize the changes to online players.

AI must not generate arbitrary executable code for normal construction actions.

Use strictly typed schemas.

Support large projects composed of multiple construction phases.

---

# 7. REAL-TIME CONSTRUCTION SYSTEM

Followers must be able to watch development projects happening live.

If the administrator begins constructing a bridge, players near the construction area should see the bridge progressing.

## Construction States
- Planned.
- Approved.
- Land preparation.
- Foundation.
- Structural construction.
- Finishing.
- Completed.
- Cancelled.

## Visual Construction
Support:
- Construction vehicles.
- Cranes.
- Animated workers.
- Scaffolding.
- Building assembly.
- Road paving.
- Terrain transformation.
- Progress indicators.
- Completion effects.

A project's progress must be generated from authoritative construction state, not from independent client-side timers.

## Multiplayer Synchronization
When construction begins:
1. Create a persistent construction project.
2. Store the project start state and phase schedule.
3. Broadcast construction events.
4. Synchronize relevant changes to connected clients.
5. Allow late-joining players to reconstruct the current progress.
6. Store the final completed world state.
7. Record the construction timeline for video rendering.

Players watching the same construction project must observe substantially consistent progress.

Support accelerated construction for cinematic events without changing unrelated world state.

The administrator must be able to pause, resume, or cancel construction where permitted.

---

# 8. CHIBI CHARACTER CREATOR

Build an interactive 3D character creation system.

All players and government officials use original chibi / miniature characters.

## Character Visual Style
- Oversized heads.
- Compact bodies.
- Expressive faces.
- Stylized proportions.
- Colorful low-poly clothing.
- Smooth cartoon animation.
- Consistent 3D materials.

## Character Customization
Allow players to customize:
- Character display name.
- Face shape presets.
- Eyes.
- Eyebrows.
- Mouth.
- Hairstyle.
- Hair color.
- Skin tone.
- Outfit.
- Outfit colors.
- Shoes.
- Hats.
- Accessories.
- Facial expressions.

Use modular 3D components and reusable character rigs.

Each character must have a persistent identity and appearance version.

Do not regenerate player characters from text prompts on every login.

## Required Character Animations
- Idle.
- Walking.
- Running.
- Talking.
- Waving.
- Pointing.
- Sitting.
- Celebrating.
- Working.
- Clapping.
- Interacting with objects.

Start with simple procedural animation, but design for rigged GLB assets and reusable animation clips.

---

# 9. MULTIPLAYER WORLD ACCESS

The website must be accessible to followers and registered citizens.

## Public Visitor Mode
Visitors can:
- View the country.
- Explore public national information.
- View construction progress.
- Watch public episodes.
- Browse election results.

Visitors must not be allowed to vote, chat, or control other player avatars without registration.

## Registered Citizen Mode
Registered users can:
- Create a virtual citizen profile.
- Customize a chibi avatar.
- Enter the 3D world.
- Walk around the country.
- Travel between regions.
- See nearby players.
- Use proximity chat.
- Interact through gestures and emotes.
- View construction projects.
- Participate in eligible elections.
- Submit development proposals.
- View their citizen profile.
- Explore virtual government buildings.

## Admin Mode
Authorized administrators can:
- Modify national geography.
- Manage infrastructure.
- Approve AI development plans.
- Start construction.
- Manage elections.
- Moderate community interactions.
- Manage official roles.
- Generate cinematic episodes.
- Manage game settings.

Use role-based authorization.
Never grant administrative permissions based solely on client-side UI state.

---

# 10. PLAYER MOVEMENT AND WORLD TRAVEL

Registered players must be able to control their 3D characters.

Support:
- WASD or arrow movement on desktop.
- Point-and-click movement where appropriate.
- Touch joystick on mobile.
- Camera rotation.
- Camera zoom.
- Camera follow.
- Fast travel to permitted regions.
- Map navigation.

The server must validate movement and travel transitions.

Implement reasonable movement speed limits and collision checks.

Prevent users from moving through buildings, crossing impassable terrain, or teleporting to unauthorized locations through manipulated client requests.

## Region Travel
Players must be able to move between:
- Provinces.
- Cities.
- Districts.
- Neighborhoods.
- Islands.

Travel can use appropriate combinations of physical movement, vehicles, transport terminals, and fast-travel interfaces.

When crossing between server-managed zones:
1. Preserve the player's identity.
2. Preserve avatar appearance.
3. Save the new virtual location.
4. Disconnect or unsubscribe from obsolete spatial subscriptions.
5. Connect to the relevant destination region.
6. Load nearby players and objects.
7. Update the local chat context.
8. Prevent duplicate avatars during handoff.

Provide loading transitions when necessary.

---

# 11. SPATIAL PROXIMITY CHAT — CRITICAL FEATURE

Implement a real-time location-based chat system.

This is NOT a country-wide global chat.

Players should only communicate through local chat when they are close to other eligible player avatars.

The goal is to prevent overcrowded chat channels.

## Basic Behavior
When a player enters a populated location, nearby player chat becomes available.

If the player is alone, hide the local chat panel or show a minimal indicator that no other players are nearby.

When the player travels elsewhere, their local chat must automatically transition to the nearby player community in the new location.

## Example
Player A is standing near the Presidential Palace.
Players B and C are within the configured proximity radius.
Player A can receive local chat messages from B and C.
Player D is in a distant port.
Player D must not receive the Presidential Palace conversation.

If Player A travels to the port, their nearby-player list and local chat context must change automatically.

## Spatial Architecture
Use a spatial indexing system.
Partition the world into spatial cells or chunks.
Each cell belongs to an administrative region.
Maintain server-authoritative avatar positions.

Determine message visibility using actual virtual coordinates rather than only administrative region names.

Recommended configurable starting values:
- Proximity chat radius: 120 virtual meters.
- Nearby player visibility radius: 180 virtual meters.
- Adaptive spatial cell dimensions.
- Client-side interpolation for movement.
- Server-side chat recipient filtering.

These values are starting configuration defaults, not permanent constraints.

## Important Boundary Behavior
Players near a cell boundary must still see and communicate with nearby players in adjacent cells.

Do not implement naive isolated chat rooms that prevent two adjacent players from communicating merely because they occupy different cells.

Evaluate distance from each eligible recipient to the sender at message time.

Administrative regions may provide organization, but spatial proximity determines local message delivery.

Use hysteresis or a short grace period to reduce repeated UI flickering near proximity boundaries.

## Automatic Chat Handoff
When a player moves:
1. Update their authoritative virtual position.
2. Recalculate nearby eligible players.
3. Update spatial subscriptions.
4. Remove messages no longer relevant to the new location.
5. Load only authorized recent local messages if history is enabled.
6. Display the new local player list.
7. Preserve connection continuity during handoff.

Never expose private messages from unrelated areas.

## Chat Interface
Create a compact in-game chat panel with:
- Nearby user count.
- Local messages.
- Character display names.
- Small avatar portraits.
- Message timestamps.
- Typing indicator, if enabled.
- Chat input.
- Minimize and expand controls.
- Mute.
- Block.
- Report.

Chat messages must not overwhelm the 3D gameplay interface.
Use a compact responsive design, especially on mobile.

## Security Requirements
- Authenticate senders.
- Validate sender world position server-side.
- Authorize chat delivery server-side.
- Limit message length.
- Rate-limit sending.
- Prevent duplicate message abuse.
- Sanitize displayed text.
- Support moderation filters.
- Provide block and report systems.
- Restrict spam and repeated messages.
- Support temporary or permanent chat suspensions.

Never trust the client to decide which players are close enough to receive messages.

## Privacy
Use virtual avatar coordinates only.

Do not request real-world GPS coordinates for proximity chat.

Do not publicly expose email addresses, phone numbers, precise real-world locations, or other sensitive account information.

Use virtual nicknames by default.

Provide strong safety and privacy controls for younger users.

---

# 12. MULTIPLAYER PRESENCE AND SCALING

The nation must remain persistent even when nobody is online.

Separate the persistent world from temporary online player sessions.

## Authoritative Multiplayer Server
Use Colyseus or an equivalent authoritative multiplayer architecture.

The server manages:
- Player sessions.
- Avatar positions.
- Room membership.
- Local interaction states.
- Construction synchronization.
- Spatial message routing.

## Interest Management
Do not broadcast the entire country's state to every player.

Send only relevant information based on:
- Player location.
- Camera vicinity.
- Current region.
- Important national events.
- Authorized subscriptions.

National map updates can use lower-frequency summaries.

Nearby avatar movement can use more frequent updates.

Avoid writing every player movement frame to PostgreSQL.

Persist significant position changes and session transitions instead.

## Disconnection Handling
Support:
- Automatic reconnection.
- Session recovery.
- Duplicate connection handling.
- Temporary network interruptions.
- Stale presence cleanup.
- Graceful travel between rooms.

## Scaling Goals
Architect the system so multiplayer regions can eventually be distributed across multiple game server processes.

Use Redis or another appropriate mechanism for cross-process coordination where required.

Do not promise a fixed concurrent-player capacity without load testing.

---

# 13. GOVERNMENT HIERARCHY

Implement a fictional government system inspired by Indonesian administrative structures.

Support:
- President.
- Vice President.
- Ministers.
- Governors.
- Deputy Governors.
- Regents.
- Mayors.
- Deputy regional leaders.
- District heads.
- Village leaders.
- Urban subdistrict leaders.
- RW leaders.
- RT leaders.

Administrative hierarchy:
Country -> Province -> Regency/City -> District -> Village/Subdistrict -> RW -> RT.

Government offices must be configurable.

Each office must have:
- Unique ID.
- Region association.
- Position title.
- Eligibility rules.
- Election rules.
- Term duration.
- Current officeholder.
- Historical officeholders.
- Assigned government buildings.
- Approved administrative permissions.

Use game-specific election rules rather than assuming every position is elected under actual Indonesian law.

## Officials as Actual Players
Government officials must be registered citizens.

An elected official keeps their original account and character identity.

The system assigns the official role to their existing avatar.

Official avatars may receive:
- Formal uniform presets.
- Official accessories.
- Government office access.
- Role title badges.
- Ceremonial animations.
- Approved regional management tools.

When the official's term ends, their character remains a normal citizen.

---

# 14. COMMUNITY CITIZENSHIP SYSTEM

Followers may register on the website to become virtual citizens.

## Registration Features
- Secure account registration.
- Username.
- Virtual citizen display name.
- Avatar creation.
- Virtual residential region.
- Citizen profile.
- Basic participation history.

Instagram username connection can be optional.

Do not assume access to a complete Instagram follower list or claim that all followers can be automatically verified.

If official Instagram account-linking functionality is unavailable, use native website accounts as the primary identity system.

Never request Instagram passwords.

Minimize collection of personal information.

## Virtual Residency
Every registered citizen belongs to a virtual residential region.

Residence determines eligibility for local elections.

Users must not be able to manipulate residence during active elections to vote repeatedly.

Allow controlled residence transfers with configurable restrictions.

---

# 15. ELECTION AND VOTING SYSTEM

Build a working virtual election engine.

## Election Workflow
1. Administrator opens an election.
2. Eligible citizens apply as candidates.
3. Candidates submit their virtual profiles and development programs.
4. Moderators review candidate applications.
5. Approved candidates appear on election pages.
6. Eligible citizens vote.
7. Election closes at the configured time.
8. Votes are counted.
9. Results are published.
10. The winner receives the official role.
11. An inauguration event is created.
12. The automatic video system may create an inauguration episode.

## Voting Requirements
- One eligible account vote per election.
- Region-based voting eligibility.
- Candidate eligibility validation.
- Configurable election schedules.
- Private individual ballots.
- Auditable result calculations.
- Unique voting constraints in the database.
- Protection against duplicate submissions.
- Rate limiting and suspicious activity checks.
- Administrative audit logs.

Provide mechanisms to detect likely duplicate accounts and abuse without collecting unnecessary sensitive personal information.

## Government Events
Support:
- Elections.
- Inaugurations.
- End of office terms.
- Resignations.
- Vacancies.
- Replacement elections.
- Government announcements.

Each event can be transformed into a cinematic episode.

---

# 16. COMMUNITY DEVELOPMENT PROPOSALS

Elected officials and eligible citizens can propose development projects.

Examples:
"Build a hospital in our district."
"Construct a bridge connecting two islands."
"Create a new railway line in the northern province."

## Proposal Flow
1. User creates a proposal.
2. System identifies the target region.
3. Permissions and proposal limits are checked.
4. AI generates a proposed development plan.
5. Relevant users or officials may review or vote according to the configured rules.
6. Administrator approves the actual world mutation.
7. Construction begins.
8. Nearby users see construction live.
9. The world is updated.
10. The event becomes available in Video Studio.

Not every proposal needs to become a national referendum.

Support configurable local and national decision-making.

Never allow a player to modify the world simply by submitting a proposal.

---

# 17. NPC POPULATION SIMULATION

The nation must contain NPC inhabitants in addition to real players.

NPC types include:
- Citizens.
- Construction workers.
- Farmers.
- Office workers.
- Shopkeepers.
- Transport workers.
- Government staff.
- Tourists.

NPCs should have simple behavior schedules.

Examples:
- Walking around public areas.
- Traveling to workplaces.
- Visiting parks.
- Performing construction animations.
- Using public transport.
- Attending government ceremonies.

## Performance
Do not instantiate one 3D NPC for every simulated citizen.

Keep population statistics separate from rendered visual NPCs.

Spawn and animate visible NPCs according to the current region and camera.

Use deterministic animation data for cinematic rendering.

Real players and NPCs must be distinguishable in the interface.

---

# 18. CHARACTER INTERACTIONS

Allow nearby players to perform simple non-invasive interactions.

Initial interactions:
- Wave.
- Greet.
- Celebrate.
- Sit.
- Point.
- Show an emote.
- View another player's public virtual profile.

Support simple in-world interaction triggers around public buildings.

Interactions must be distance-validated where relevant.

Do not automatically expose private profile information.

Use player controls and consent for interactions that require two participants.

---

# 19. AUTOMATIC VIDEO GENERATION

The application must automatically produce actual video files based on nation events.

This is a core feature.

Do not substitute still images for a complete video pipeline.

## Video Sources
Use:
- Persistent 3D world state.
- World event history.
- Construction timelines.
- Government character assets.
- Player-approved character appearances.
- Camera choreography.
- Scripted animation.
- Narration audio.
- Subtitle timing.

## Supported Episode Types
- Founding of the nation.
- New island creation.
- Province establishment.
- Infrastructure construction.
- National development projects.
- Election results.
- Inauguration ceremonies.
- Presidential announcements.
- Community development milestones.
- Regional celebrations.

## Video Pipeline
1. Select a nation event.
2. Freeze the required world snapshot.
3. Read relevant character asset versions.
4. Generate a storyboard.
5. Generate narration.
6. Select camera paths.
7. Build deterministic animation timelines.
8. Preview the episode.
9. Queue the rendering job.
10. Render real 3D frames.
11. Compose audio and subtitles.
12. Export MP4.
13. Save episode metadata and media files.
14. Make the finished video available to administrators.

## Video Specifications
Default:
- Vertical 9:16.
- 1080 x 1920.
- 30 FPS.
- H.264 MP4.
- Configurable duration.
- Indonesian narration.
- Optional English language support.

## Cinematic Features
- Isometric aerial view.
- Cinematic camera orbit.
- Camera tracking.
- Construction time-lapse.
- Character close-ups.
- Drone-style national overview.
- Inauguration scenes.
- Before and after comparisons.
- Nation map transitions.

## Deterministic Rendering
A frame must produce the same relevant world and character state when re-rendered from the same immutable inputs.

Use frame-based animation.

Separate real-time multiplayer movement from cinematic animation.

Never rely on live network state while rendering an immutable episode.

## Real-Time Event Recording
When a real construction project occurs:
- Store the construction event sequence.
- Record authoritative project state transitions.
- Store relevant character interactions if explicitly approved for recording.
- Save timestamps, asset references, and world versions.

The episode renderer reconstructs the event cinematically.

Do not secretly record private proximity chats in published videos.

Player dialogue or identifiable character appearances in published content must follow clearly disclosed participation and privacy settings.

## Automatic Episode Director
Implement reusable templates for:
- New building announcement.
- Construction.
- National project completion.
- Election.
- Inauguration.
- New territory.
- Community proposal.

Allow the administrator to edit camera, narration, and scene order before publishing.

---

# 20. WORLD AND CHARACTER PERSISTENCE

Every significant change must be stored.

## World Versioning
Use:
- World snapshots.
- World mutation events.
- Terrain versions.
- Construction project histories.
- Administrative region histories.

## Character Versioning
Store:
- Original appearance.
- Updated appearance versions.
- Clothing presets.
- Government role assignments.
- Character model references.
- Animation asset versions.

## Episode Versioning
Each episode must reference an immutable snapshot of:
- World state.
- Terrain.
- Building assets.
- Character appearances.
- Government roles.
- Construction event data.

Changing the nation later must not alter previously generated episodes.

---

# 21. DATABASE DESIGN

Design relational tables and migrations for at least:

## Accounts and Players
- users
- citizen_profiles
- characters
- character_appearances
- character_assets
- character_sessions
- player_last_locations
- player_privacy_settings

## World
- nations
- regions
- region_boundaries
- terrain_chunks
- terrain_versions
- world_objects
- roads
- infrastructure
- world_events
- world_snapshots

## Government
- government_offices
- office_terms
- official_assignments
- elections
- candidates
- voter_eligibility
- ballots
- election_results
- development_proposals

## Multiplayer and Chat
- chat_messages
- chat_reports
- user_blocks
- moderation_actions
- connection_audit_events

Keep high-frequency player position data in the multiplayer server's ephemeral state rather than continuously inserting every update into PostgreSQL.

## Construction and Video
- construction_projects
- construction_phases
- episode_projects
- episode_scenes
- video_render_jobs
- media_assets

Use proper indexes, foreign keys, unique constraints, and ownership validation.

Implement database migrations.

---

# 22. USER INTERFACE AND DASHBOARDS

Create a polished, responsive web interface.

Default language: Bahasa Indonesia.

Support future English localization.

## Main Navigation

### World Map
View the entire country, islands, provinces, and infrastructure.

### Explore Nation
Enter the 3D multiplayer world with a player avatar.

### Character Creator
Customize and save the citizen's chibi character.

### Local Chat
Show nearby eligible players and proximity messages.

### Government
Browse administrative regions, officials, and office terms.

### Elections
Register as a candidate and participate in eligible elections.

### Development Proposals
Submit and track national or regional development proposals.

### World Builder
Authorized world and terrain editor.

### AI Builder
Administrator-controlled AI construction planning.

### Video Studio
Create, preview, render, and manage episodes.

### Admin Control Center
Moderation, construction administration, election management, role permissions, and analytics.

## UI Requirements
- Attractive nation-building aesthetic.
- Clean modern panels.
- Large interactive 3D viewport.
- Compact chat overlay.
- Responsive mobile layout.
- Visible construction progress.
- Clear loading and error states.
- Accessible buttons and controls.
- Performance-aware rendering.

Do not copy the visual identity of another game or social media creator.

---

# 23. COMMUNITY SAFETY AND MODERATION

The platform supports real user-generated communication.

Implement safety features before opening public chat.

Required features:
- Clear community rules.
- Report messages and profiles.
- User blocking.
- Message rate limiting.
- Spam detection.
- Appropriate language filtering.
- Moderator review tools.
- Temporary chat restrictions.
- Account suspension tools.
- Audit logs.
- Privacy settings.
- Pseudonymous display names.
- Configurable chat retention.

Protect younger users.

Do not expose private account contact information or real-world location.

Do not build unrestricted stranger direct messaging into the initial release.

Only virtual-location proximity is used for regional chat.

---

# 24. SECURITY ARCHITECTURE

Apply:
- Secure authentication.
- Server-side role authorization.
- Database Row Level Security.
- Validated API requests.
- Typed schemas.
- Rate limits.
- Secure API key storage.
- Protected admin routes.
- Audit logging.
- Input sanitization.
- Transactional world mutations.
- Election integrity constraints.
- Protected multiplayer commands.
- Controlled AI execution.

Do not trust client-generated player positions, chat recipient lists, election results, or administrator role claims.

Separate authenticated user IDs from public display names.

---

# 25. PERFORMANCE OPTIMIZATION

The project must be designed for a growing country and multiplayer population.

Implement appropriate:
- World chunk loading.
- Terrain level of detail.
- Object instancing.
- Character animation optimization.
- Spatial partitioning.
- Network interest management.
- Caching.
- Background processing.
- Render queues.
- Server observability.
- Connection health monitoring.

Prioritize stable gameplay over unnecessary visual complexity.

Include lower graphics settings for mobile devices.

Use actual performance measurements before claiming support for large concurrent-player numbers.

---

# 26. MONOREPO STRUCTURE

Use a maintainable monorepo similar to:

ai-nation-builder/
  apps/
    web/
    multiplayer-server/
    render-worker/

  packages/
    shared/
    nation-core/
    world-engine/
    terrain-editor/
    region-system/
    construction-engine/
    ai-builder/
    character-core/
    character-creator/
    npc-simulation/
    multiplayer-core/
    spatial-chat/
    government/
    elections/
    video-engine/
    episode-director/

  assets/
    terrain/
    buildings/
    infrastructure/
    characters/
    animation/
    vehicles/
    audio/

  supabase/
    migrations/

  tests/
    unit/
    integration/
    e2e/
    multiplayer/

  docker-compose.yml
  README.md

Adapt the structure if a simpler verified design is more maintainable.

Keep gameplay logic separate from UI rendering.

Share typed domain models between the frontend, backend, and rendering systems.

---

# 27. DEVELOPMENT ROADMAP

Do not attempt to implement every feature in one unverified development session.

Build in phases, maintaining a runnable application.

## Phase 1 — 3D Nation Foundation
Implement:
- Working Next.js application.
- Functional 3D world.
- Starter island.
- Isometric camera.
- Terrain chunks.
- Basic infrastructure.
- Object placement.
- World persistence.

Acceptance criteria:
The administrator can place and save a building in a real 3D world, refresh the page, and see the same building in the same location.

## Phase 2 — Expandable Nation Map
Implement:
- Island creation.
- Terrain expansion.
- Coastline editing.
- Administrative region hierarchy.
- World versioning.

Acceptance criteria:
A new island can be added without modifying or deleting existing world objects.

## Phase 3 — Chibi Citizens and Multiplayer
Implement:
- Account registration.
- Character Creator.
- Avatar movement.
- Multiplayer server.
- Nearby player visibility.
- Region transitions.

Acceptance criteria:
Two authenticated browser sessions can see and interact with their respective persistent avatars in the same 3D location.

## Phase 4 — Spatial Proximity Chat
Implement:
- Spatial indexing.
- Nearby player detection.
- Local chat delivery.
- Automatic chat handoff.
- Nearby chat interface.
- Moderation foundations.

Acceptance criteria:
Three players are connected.
Player A and B are nearby.
Player C is far away.
Messages from A reach B but do not reach C.
After C moves near A, C can receive subsequent local messages.
When B moves away, B stops receiving messages from the previous area.
The test must also cover players on opposite sides of a spatial cell boundary who remain within the proximity radius.

## Phase 5 — Government and Elections
Implement:
- Citizen registration.
- Government hierarchy.
- Candidate registration.
- Election administration.
- Actual vote recording.
- Result calculation.
- Office assignments.

Acceptance criteria:
An eligible citizen can vote exactly once in an election, the database enforces that restriction, and the winning citizen receives the correct official role.

## Phase 6 — AI Builder and Construction
Implement:
- Validated AI construction plans.
- Approval workflows.
- Construction timelines.
- Realtime construction synchronization.
- Persistent completed projects.

Acceptance criteria:
The administrator creates a construction plan, approves it, and two connected players see the same project's progress.

## Phase 7 — Automatic Video Generator
Implement:
- Real 3D cinematic scenes.
- Camera choreography.
- Construction time-lapse.
- Character animation.
- MP4 export.
- Episode management.

Acceptance criteria:
A real construction event is converted into a playable vertical MP4 containing the actual saved world and assets.

Start with a 10–15 second video before building longer episodes.

## Phase 8 — Production Readiness
Implement:
- Full moderation.
- Infrastructure scaling.
- Performance optimization.
- Error recovery.
- Better visual assets.
- Deployment.
- Monitoring.
- Backups.
- Security review.
- Load testing.

Do not open public multiplayer chat until required moderation, privacy, and security controls are functioning.

---

# 28. REQUIRED TESTS

Provide meaningful tests for:
- World save/load.
- Terrain versioning.
- Cross-chunk consistency.
- Building collision detection.
- Character persistence.
- Multiplayer synchronization.
- Region travel.
- Nearby player detection.
- Cross-boundary spatial chat.
- Chat recipient authorization.
- Chat moderation.
- Election eligibility.
- Duplicate vote prevention.
- Official role assignment.
- AI command validation.
- Construction state synchronization.
- Video snapshot consistency.
- Actual video rendering.

Never claim a feature works without verifying it.

---

# 29. ENGINEERING RULES

1. Inspect the existing repository before changing anything.
2. If the repository is empty, initialize the project cleanly.
3. Install dependencies using compatible, supported versions.
4. Read current official documentation when implementing unfamiliar APIs.
5. Keep the application runnable after each phase.
6. Write real code instead of purely decorative mockups.
7. Use meaningful tests.
8. Report actual build and test results.
9. Never invent successful results.
10. Do not skip security-critical features when enabling public multiplayer functionality.
11. Use configuration flags for unfinished modules.
12. Document setup and environment requirements.
13. Keep API keys outside client bundles.
14. Favor reusable modules over duplicated implementations.
15. Avoid rewriting stable systems without justification.
16. Deliver each phase as verifiable, incremental development work.

---

# 30. INITIAL IMPLEMENTATION TASK

Begin developing AI Nation Builder now.

First, inspect the repository and available development environment.

Then produce:
1. A brief architecture assessment.
2. The proposed monorepo structure.
3. The initial database schema.
4. The Phase 1 implementation.
5. A functioning low-poly 3D island nation prototype.
6. A controllable isometric camera.
7. Manual object placement.
8. Persistent world saving and loading.
9. Basic documentation.
10. Test results.

Prioritize a real, visually coherent 3D nation environment.

The initial map must already use an architecture compatible with future island expansion, multiplayer avatars, administrative boundaries, regional chat, and automatic video generation.

Do not create a static screenshot and claim it is a playable world.

Do not attempt to fully implement all 8 phases at once.

After Phase 1, provide a clear implementation report including:
- Completed functionality.
- Relevant files.
- Commands used.
- Tests performed.
- Known issues.
- Recommended next development phase.

The long-term goal is a living nation where citizens can enter the 3D world, watch construction happening around them, communicate only with nearby players, elect their government, expand national territory, and generate consistent cinematic episodes automatically.

Build the technical foundation for that vision.


## Active local foundation — 5 November 2026
Owner authorizes Phase 6 AI Builder locally/offline from Phase 5C Pass 3 (0f39194). Keep all 25 permanent table signatures, 32 objects and revision 0. Refinement fixture: /demo-city. Isolated planning/construction: /demo-construction; no database/API writes. Reports: docs/PHASE_5C_REFINEMENT_REPORT.md and docs/PHASE_6_AI_BUILDER_FOUNDATION_REPORT.md. New work is reviewed on review/phase6-local-foundation-20261105. No paid Railway/AWS, merge or full video-generator activation.
