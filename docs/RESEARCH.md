# Reference research — 2026-10-16

Reference: **Slay the Spire**, the original single-player game released January 23, 2019. Standard baseline combat, not Ascension modifiers, the board game, or Slay the Spire 2. No claim to reproduce a particular binary patch. All original audiovisual assets, characters, card text, encounters and source code in this project were created for Lantern Ascent.

## Evidence and implementation consequences

1. [Mega Crit's official press kit](https://www.megacrit.com/press-kits/slay-the-spire/) describes a fusion of card games and roguelikes, building a deck, creatures and powerful relics. It lists procedural levels, multiple characters and many encounters. Here: one character, three ember modifiers, a bounded route and original foes.
2. [Official Steam product page](https://store.steampowered.com/app/646570/Slay_the_Spire/) lists the 2019 release, dynamic deck building, route risk choices and relic interactions. Here: card rewards can be skipped, an optional elite yields opening energy, and an event lets the player thin the deck. The route topology is fixed and visible rather than procedurally generated.
3. [Community-maintained gameplay reference](https://slay-the-spire.fandom.com/wiki/Gameplay) explains the five-card hand, three energy, end-turn discard, reshuffle from discard when draw is empty, combat-only exhaust and powers, rewards, rest sites and upgrades. These numerical baseline rules shape the engine. This community source supplements official descriptions; it is not represented as official documentation. The code and card text are original, not copied from the wiki.
4. [Block reference](https://slay-the-spire.fandom.com/wiki/Block) and [Intent reference](https://slay-the-spire.fandom.com/wiki/Intent) were requested but retrieval failed. Owner-turn Block expiration and deterministic visible intent are explicit project rules documented and tested here, not a claim that inaccessible pages were verified.

## Fidelity boundary

Recognizable loop: fixed side-on battlefield; bearer at left, enemies at right; intent overhead; hand along bottom; energy costs; single-target attacks; defensive timing; shared draw/discard cycle; exhaust and powers; persistent deck growth/removal/upgrades; map/reward/rest/boss sequence.

Intentional simplifications: six route tiers, fixed topology, one hero, ten card kinds, three enemy shapes, no gold/shop, potions, curses, status cards, retain, ethereal, vulnerable, relic draft, three-act campaign, ascension, metaprogression, daily modes, sound or animations beyond hover/health feedback. Encounter patterns and hp are original tuning, not Slay the Spire data. Weak only exists on enemies. Upgrades add flat effect values; energy costs never change. New run advances the seed by 7919. Saves are local to this origin and namespaced.

## Design frontier resolved by authorized defaults

Scope: one meaningful bounded act. Art: original SVG silhouettes and brass/paper UI. Rule seam: deterministic command API. Difficulty: readable opening, optional elite risk, escalating multi-hit boss. Persistence: autosave each action, versioned validation, only one project key touched. QA: headless behavioral/browser tests first, native ordinary-control acceptance only after parent handoff. User explicitly chose recommended defaults without optional questions, overriding interview pauses in the local Grill skill.

## OS ignore provenance

The .gitignore includes the complete official [Linux](https://github.com/github/gitignore/blob/main/Global/Linux.gitignore), [Windows](https://github.com/github/gitignore/blob/main/Global/Windows.gitignore), and [macOS](https://github.com/github/gitignore/blob/main/Global/macOS.gitignore) templates from github/gitignore, fetched 2026-10-16, followed by project exclusions. github/gitignore is [CC0-1.0](https://github.com/github/gitignore/blob/main/LICENSE).
