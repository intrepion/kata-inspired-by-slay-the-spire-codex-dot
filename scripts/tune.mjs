import {
  newRun,
  legalNodes,
  chooseNode,
  rule,
  play,
  endTurn,
  takeReward,
  event,
  rest,
  intent,
} from "../src/engine.ts";
function score(s) {
  const c = s.combat;
  if (s.phase === "reward" || s.phase === "won") return 10000 + s.hp;
  if (s.phase === "lost") return -10000;
  return (
    s.hp * 5 - c.enemies.reduce((v, e) => v + e.hp * 2, 0) + c.strength * 8
  );
}
function bestTurn(s) {
  let frontier = [s],
    best = s,
    bestScore = -Infinity;
  for (let depth = 0; depth < 8 && frontier.length; depth++) {
    let next = [];
    for (const state of frontier) {
      let ended = structuredClone(state);
      endTurn(ended);
      let val = score(ended);
      if (val > bestScore) {
        bestScore = val;
        best = state;
      }
      if (state.phase !== "combat") continue;
      for (const card of state.combat.hand) {
        let r = rule(card);
        for (const target of r.target
          ? state.combat.enemies.filter((e) => e.hp > 0).map((e) => e.id)
          : [undefined]) {
          let b = structuredClone(state);
          if (play(b, card.id, target)) next.push(b);
        }
      }
    }
    let seen = new Set();
    frontier = next
      .sort((a, b) => score(b) - score(a))
      .filter((s) => {
        let k = JSON.stringify(s.combat);
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      })
      .slice(0, 80);
  }
  return best;
}
const results = [];
for (let seed = 2718; seed < 2728; seed++) {
  let s = newRun(seed),
    turns = 0;
  while (!["won", "lost"].includes(s.phase) && turns < 200) {
    if (s.phase === "map") {
      let ns = legalNodes(s);
      let n =
        ns.find((n) => n.type === "event") ??
        ns.find((n) => n.type === "elite") ??
        ns.find((n) => n.lane === 1) ??
        ns[0];
      chooseNode(s, n.id);
    } else if (s.phase === "combat") {
      s = bestTurn(s);
      if (s.phase === "combat") {
        endTurn(s);
        turns++;
      }
    } else if (s.phase === "reward") {
      const preferred = [
        "focus",
        "bash",
        "siphon",
        "sweep",
        "bastion",
        "surge",
        "flare",
        "read",
      ];
      takeReward(
        s,
        preferred.find(
          (k) => s.rewards.includes(k) && !s.deck.some((c) => c.kind === k),
        ) ?? null,
      );
    } else if (s.phase === "event") {
      event(s, s.deck.find((c) => c.kind === "cut")?.id ?? null);
    } else if (s.phase === "rest") {
      rest(
        s,
        s.hp < 40
          ? null
          : (s.deck.find((c) => c.kind === "flare" && !c.upgraded)?.id ?? null),
      );
    }
  }
  results.push({
    seed,
    result: s.phase,
    hp: s.hp,
    turns,
    path: s.path,
    cards: s.deck.map((c) => c.kind + (c.upgraded ? "+" : "")),
  });
}
console.log(JSON.stringify(results, null, 2));
