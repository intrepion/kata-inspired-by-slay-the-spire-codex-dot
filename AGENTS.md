# Engineering guidance
Keep combat in the deterministic engine. UI dispatches commands and renders state; it must never change combat fields directly. Strict TypeScript, no implicit randomness, no secrets or copied game assets. Test rules through public commands and save boundaries. Validate with npm run check, npm test, npm run build. Do not touch other projects, ports or saves.
