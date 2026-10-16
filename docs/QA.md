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

## Native acceptance — pending handoff

The shared native browser has **not** been used by this task. The parent explicitly queued this game behind Mario Paint, California Games and Candy Crush. Native full-run acceptance requires the parent's explicit browser handoff. Headless and simulation evidence above must not be described as native gameplay.

Production preview is a detached Vite process on `127.0.0.1:5227`, serving `dist`. It was independently observed listening after its launch command ended. No public website deployment is configured; the public deliverable is the GitHub source repository.
