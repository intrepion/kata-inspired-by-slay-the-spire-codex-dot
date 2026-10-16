import { chromium } from "@playwright/test";
import { rule, play, endTurn, legalNodes } from "../src/engine.ts";
import { mkdirSync, writeFileSync } from "node:fs";
mkdirSync(".qa", { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const check = (v, msg) => {
  if (!v) throw Error(msg);
};
const state = () =>
  page.evaluate(() =>
    JSON.parse(localStorage.getItem("lantern-ascent:v1:run")),
  );
function score(s) {
  const c = s.combat;
  if (s.phase === "reward" || s.phase === "won") return 10000 + s.hp;
  if (s.phase === "lost") return -10000;
  return (
    s.hp * 5 - c.enemies.reduce((v, e) => v + e.hp * 2, 0) + c.strength * 8
  );
}
function plan(s) {
  let frontier = [{ s, actions: [] }],
    best = [],
    bestScore = -Infinity;
  for (let depth = 0; depth < 8 && frontier.length; depth++) {
    let next = [];
    for (const item of frontier) {
      let ended = structuredClone(item.s);
      endTurn(ended);
      let val = score(ended);
      if (val > bestScore) {
        bestScore = val;
        best = item.actions;
      }
      if (item.s.phase !== "combat") continue;
      for (const card of item.s.combat.hand) {
        const r = rule(card);
        for (const target of r.target
          ? item.s.combat.enemies.filter((e) => e.hp > 0).map((e) => e.id)
          : [undefined]) {
          let b = structuredClone(item.s);
          if (play(b, card.id, target))
            next.push({
              s: b,
              actions: [...item.actions, { id: card.id, target }],
            });
        }
      }
    }
    let seen = new Set();
    frontier = next
      .sort((a, b) => score(b.s) - score(a.s))
      .filter((x) => {
        const key = JSON.stringify(x.s.combat);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 80);
  }
  return best;
}
try {
  await page.goto("http://127.0.0.1:5227");
  await page.evaluate(() =>
    localStorage.setItem("unrelated-project-sentinel", "preserved"),
  );
  await page.screenshot({ path: ".qa/map.png", fullPage: true });
  await page.locator('[data-node="0-1"]').click();
  let s = await state();
  const first = s.combat.hand.find((c) => c.kind === "cut");
  await page.locator(`[data-play="${first.id}"]`).click();
  check(
    (await state()).combat.energy === 3,
    "Selecting target must not spend energy",
  );
  await page.locator('[data-target="1"]').click();
  check((await state()).combat.energy === 2, "Attack cost");
  const ward = (await state()).combat.hand.find((c) => c.kind === "ward");
  await page.locator(`[data-play="${ward.id}"]`).click();
  check((await state()).combat.block === 5, "Block effect");
  const ward2 = (await state()).combat.hand.find((c) => c.kind === "ward");
  await page.locator(`[data-play="${ward2.id}"]`).click();
  check((await state()).combat.energy === 0, "Energy spent");
  check(
    (await page.locator("[data-play]:disabled").count()) > 0,
    "Unaffordable cards disabled",
  );
  await page.screenshot({ path: ".qa/combat.png", fullPage: true });
  const before = await state();
  await page.reload();
  check(
    JSON.stringify(await state()) === JSON.stringify(before),
    "Exact save reload",
  );
  await page.getByRole("button", { name: "Field guide", exact: true }).click();
  for (let i = 0; i < 12; i++) await page.keyboard.press("Tab");
  check(
    await page.evaluate(() =>
      Boolean(document.activeElement.closest(".modal")),
    ),
    "Modal focus containment",
  );
  await page.keyboard.press("Escape");
  let turns = 0,
    actions = 0,
    choices = [];
  while (turns < 150) {
    s = await state();
    if (s.phase === "won" || s.phase === "lost") break;
    if (s.phase === "map") {
      const ns = legalNodes(s),
        n =
          ns.find((n) => n.type === "event") ??
          ns.find((n) => n.type === "elite") ??
          ns.find((n) => n.lane === 1) ??
          ns[0];
      await page.locator(`[data-node="${n.id}"]`).click();
      choices.push(n.id);
    } else if (s.phase === "combat") {
      for (const action of plan(s)) {
        await page.locator(`[data-play="${action.id}"]`).click();
        if (action.target !== undefined)
          await page.locator(`[data-target="${action.target}"]`).click();
        actions++;
      }
      if ((await state()).phase === "combat") {
        await page.locator("[data-end]").click();
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
      const k =
        preferred.find(
          (k) => s.rewards.includes(k) && !s.deck.some((c) => c.kind === k),
        ) ?? "skip";
      await page.locator(`[data-reward="${k}"]`).click();
      choices.push(k);
    } else if (s.phase === "event") {
      await page
        .locator(`[data-choice="${s.deck.find((c) => c.kind === "cut").id}"]`)
        .click();
      choices.push("remove cut");
    } else if (s.phase === "rest") {
      const id =
        s.hp < 40
          ? "special"
          : (s.deck.find((c) => c.kind === "flare" && !c.upgraded)?.id ??
            "special");
      await page.locator(`[data-choice="${id}"]`).click();
      choices.push(`rest ${id}`);
    }
  }
  const outcome = await state();
  check(outcome.phase === "won", "Full UI run should win");
  await page.screenshot({ path: ".qa/victory.png", fullPage: true });
  await page.locator("[data-restart]").first().click();
  await page.locator("[data-new]").click();
  check((await state()).phase === "map", "Restart");
  await page.locator('[data-node="0-1"]').click();
  for (let i = 0; i < 40 && (await state()).phase === "combat"; i++)
    await page.locator("[data-end]").click();
  check((await state()).phase === "lost", "Loss via ordinary controls");
  await page.screenshot({ path: ".qa/loss.png", fullPage: true });
  await page.reload();
  check((await state()).phase === "lost", "Loss reload");
  await page.locator("[data-restart]").first().click();
  await page.locator("[data-new]").click();
  check(
    (await page.evaluate(() =>
      localStorage.getItem("unrelated-project-sentinel"),
    )) === "preserved",
    "Save isolation",
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: ".qa/mobile.png", fullPage: true });
  check(
    (await page.evaluate(() => document.documentElement.scrollWidth)) === 390,
    "Mobile no horizontal overflow",
  );
  check(!errors.length, `Browser errors: ${errors}`);
  const result = {
    headless: true,
    native: false,
    turns,
    actions,
    choices,
    outcome: outcome.phase,
    hp: outcome.hp,
    errors,
    reload: true,
    loss: true,
    restart: true,
    saveIsolation: true,
    mobileWidth: 390,
  };
  writeFileSync(".qa/browser-result.json", JSON.stringify(result, null, 2));
  console.log(result);
} finally {
  await browser.close();
}
