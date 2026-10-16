# Lantern Ascent

An original browser roguelike deckbuilder closely inspired by the **original Slay the Spire (2019)**. Carry a lantern through a six-stop expedition: choose a route, read enemy intents, spend energy carefully, build a deck, and face the Beacon Keeper.

## Run locally

Requires Node.js 24 and npm.

```sh
npm ci
npm test
npm run build
npm run preview
```

Production preview: http://127.0.0.1:5227/. Development: `npm run dev`.

## Play

- Click a connected route node. Click a card, then a living enemy for targeted attacks. Skills and area attacks play immediately.
- Start each turn with 3 energy and 5 cards. End turn discards the hand, resolves each living enemy's displayed intent from left to right, clears your remaining Block, refills energy and draws again.
- Block absorbs damage before health. Enemy Block clears when that enemy next acts. Weak reduces attacks by 25%, rounded down, and counts down after that enemy acts. Strength adds damage to every hit.
- Draw from an empty pile reshuffles discard. Exhaust and played powers stay out until the encounter ends. Hand limit: 10.
- Choose one of three reward cards, or skip. The Archivist removes a card or grants opening Block. The elite grants Storm Lens, adding 1 energy on each first turn. Rest heals 19 HP or permanently upgrades a card. Hearth Coal heals 4 HP after non-boss victory.
- Win by defeating the summit boss; zero HP ends the run. Restart prompts before replacing this game's save.
- Mouse/touch or Tab/Space; **1–0** select hand cards, **Esc** cancel/close, **Enter** end turn when a button isn't focused, **D** inspect deck. Pile buttons inspect sorted contents without revealing draw order.

Autosave uses only `lantern-ascent:v1:run`. Saves persist on this browser origin. No accounts, telemetry, network assets or backend. Storage errors leave the current in-memory run playable.

## Design, reference and omissions

[Research and fidelity notes](docs/RESEARCH.md) cite Mega Crit, the official Steam page and a labeled community rules reference. [Specification](docs/SPEC.md), [glossary](CONTEXT.md), and [bounded-run decision](docs/adr/0001-bounded-run.md) record the design.

This is one short act with ten original card kinds and three ember modifiers. Route topology is fixed; shuffles and reward draws are seeded. It omits shops/gold, potions, multiple heroes, long campaigns, Ascension, metaprogression, most statuses and audio. Enemy patterns, names, art and card effects are original. It is an independent study, unaffiliated with Mega Crit.

## Validation

`npm run check`, `npm test`, `npm run build`. Behavior tests cover target/cost rejection, effects, pile cycling, exhaust, powers, hand cap, Block and Weak timing, ordered enemy turns, rewards/skip, route legality, rest/upgrades, deck removal, embers, death/boss outcomes and save validation. See [QA evidence](docs/QA.md) for measured tuning and the explicit distinction between simulation, headless and native coverage.

## License

Original code, vector art and written content: [MIT](LICENSE). No borrowed game assets. Official GitHub Global Linux/Windows/macOS ignore templates are included under their CC0 terms; links are in research notes. Build/test dependencies retain their own licenses in npm packages. System fonts and Unicode symbols are rendered by the user's OS.
