# QA and tuning evidence

## Automated behavior

23 Vitest tests pass. Public engine commands cover energy/cost/target rejection without mutation; five-card opening, seeded shuffles, discard refill, exhaust and power separation, draw cap; attacks/Block/Strength/healing; Weak rounding and owner-turn expiration; exact intents, enemy Block expiration and left-to-right turns with death short-circuit; dead enemy exclusion; legal route adjacency; three distinct rewards and skip; rest versus upgrades; removal and opening embers; elite rewards and terminal boss/death. Save tests round-trip state/RNG and reject malformed JSON, prototype rule keys, mismatched cards/zones, impossible route/phase, negative status, duplicate enemies and missing encounter flags and empty action logs.

Strict TypeScript and production build pass. Dependencies were updated to Vite 8.3.4 and Vitest 5.0.5; npm reported zero advisories after installation.

## Isolated headless browser — passed

`npm run test:browser` against the production preview uses an isolated Chromium profile. No shared native browser interaction occurred. It reads the save to plan moves and executes ordinary visible buttons; it does not inject engine mutations or edit the run save. An unrelated storage sentinel is setup-only test data.

- Seed 2718, opening at Broken Steps. Selected attack without spending energy until target selection; then spent all three energy, verified unaffordable cards disabled and gained 10 Block against the visible 7-damage intent.
- Full UI run: **53 card plays, 19 completed turns, boss victory with 52/64 HP**. Reward sequence: Stone Promise, Horizon Arc, Dimming Blow. Removed Copper Edge, defeated the elite for Storm Lens, upgraded Last Light at Quiet Hearth, defeated Beacon Keeper.
- Exact serialized combat state survived page reload. A second expedition intentionally ended turns without cards until death; loss survived reload. Restart returned to map. The unrelated storage sentinel remained intact throughout.
- Field guide remained keyboard-focused after repeated Tab presses. No uncaught browser exceptions. At 390px width, no horizontal document overflow.
- Screenshots visually inspected at desktop and mobile widths. Map edges now match actual engine adjacency; original vector characters, intent labels, health, hand and outcome are legible.

Screenshots: [map](screenshots/map.png), [combat](screenshots/combat.png), [victory](screenshots/victory.png).

## Simulation and balance

`npm run tune` performs ten seeded runs (2718–2727) with a beam-search tactical player. It explores up to eight plays and retains 80 turn states, scores health/damage/Strength, prefers a deck-removal event and elite, picks new reward kinds, and upgrades Last Light if healthy.

All ten simulations won: **13–19 turns**, **45–60 HP remaining**. These are solver-assisted results, not human win-rate measurements. The intentional difficulty is an introductory bounded expedition; a skilled player can preserve most health. The no-card browser run loses. A 7–12 minute human run is a design target, not a measured median. There is no claim of full Slay the Spire balance or content breadth.

## Independent reviews

The local Matt Pocock Implement / Code Review workflow was used with separate Standards and Spec reviewers against empty baseline `6d259c4`. Findings: malformed-save invariants, misleading decorative map lines, inaccessible intent descriptions, and missing modal focus containment. These were corrected, with save regression tests and headless focus coverage. No production account, credential, security policy or other project's save was modified.

## Native acceptance — passed, 2026-10-16

After the parent explicitly transferred exclusive browser ownership from Candy Crush, a new Chrome tab opened the production preview. The run used ordinary accessibility/button clicks and keyboard inputs through the native browser connection. No hidden state reads, solver, JavaScript state mutations, save injection or developer shortcuts were used for this native run. All pre-existing tabs and other project saves were left alone.

- Seed **2718**, route: **Broken Steps → Brass Archivist (left lane) → Iron Orchard elite → Hollow Bridge → Quiet Hearth (center) → Beacon Keeper**.
- Selecting Copper Edge left energy at 3 until choosing Ashwing. One attack and two shields spent all energy and yielded 10 Block against a displayed 7-damage attack. Further card-key input at 0 energy was rejected. Reload retained 64 HP, 10 Block, 0 energy, and Ashwing at 18 HP. End turn absorbed the attack, cleared remaining Block and refilled energy.
- Chose Stone Promise, removed Copper Edge at the Archivist, earned Storm Lens from the elite, **skipped** its card reward, then chose Warmth Thief after Hollow Bridge. The next encounter opened with 4 energy from Storm Lens; subsequent turns refilled to 3.
- Inspected the hearth's exclusive rest-versus-upgrade choices and **upgraded Last Light** rather than healing. The boss hand displayed its upgraded 17-damage description. The heal branch remains covered by engine tests, not this native run.
- Against two enemies, targeted and eliminated Cinder Moth first, then broke Gale Husk's Block. Against the boss, 19 Block absorbed the initial 8 × 2 intent with no HP loss; the later 11 × 2 intent dealt exactly 3 through 19 Block.
- **Won the complete bounded run at 31/64 HP, with 11 cards and 2 embers.** Victory and these displayed totals survived reload. [Native victory screenshot](screenshots/native-victory.jpg).
- Restart confirmation led to seed 10637. Deliberately played no cards and ended 12 turns until **0 HP / Expedition Ended**. Loss survived reload. [Native loss screenshot](screenshots/native-loss.jpg).
- Restarted once more, leaving a fresh **seed 18556** expedition at 64 HP. The game tab remains open as the deliverable. Native browser/screen/input ownership was explicitly released after this verification.

No gameplay defects requiring code changes were found during native acceptance. Automated malformed-save, status timing, rest-heal, mobile and storage-sentinel results remain separately identified above; they are not claimed as native coverage.

Production preview is a detached Vite process on `127.0.0.1:5227`, serving `dist`. It was independently observed listening after its launch command ended. No public website deployment is configured; the public deliverable is the GitHub source repository.
