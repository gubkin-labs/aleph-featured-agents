---
name: check-weather
description: Fetch current weather conditions via the bundled Open-Meteo script.
---

When the user asks about weather, or a schedule requests a weather check:

1. Resolve a location (city name or latitude/longitude). Default to London if none is known.
2. Run `scripts/check-weather.ts` with either a city name or `--lat` / `--lon`.
3. Summarize the script output using the Response style section in `AGENTS.md`.
4. Optionally save the preferred location with the `memory` tool.
