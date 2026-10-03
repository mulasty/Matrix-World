# Matrix World — Master Plan

Branch: `matrix-rebuild`  
Upstream base at fork time: `LimitedByHumanity/Star-Net` / `feat/harness-backend`

## Goal

Turn the StarNet codebase into **Matrix World**: a local-first command center for Piotr's existing Matrix multi-agent stack, with OpenCode/Hermes/Codex-style workers, project-aware orchestration, Polish-first UI, live observability, and a visual world that reflects real agent state.

The rule inherited from the upstream architecture remains valuable: the UI must never invent agent state. Rooms, agents, work, cost, tools, permissions, and status must be projections of real runtime data.

## Product shape

Matrix World has two synchronized views over the same runtime:

1. **World view** — spatial/visual representation of agents, teams, project rooms, tools, handoffs, and activity.
2. **Command view** — operator dashboard for tasks, sessions, costs, context, models, repos, branches, permissions, logs, outputs, and intervention.

Both views consume the same normalized Matrix runtime events.

## Core integration target

```
Matrix World UI
      |
Matrix adapter / control plane
      |
+-----+-------------------+------------------+
|                         |                  |
Matrix MCP             OpenCode           Hermes / other harnesses
|                         |                  |
GitHub / Vercel / Supabase / Drive / browser / local tools
```

The existing StarNet sidecar remains useful as a local execution/consent/persistence layer where it fits. Matrix-specific runtimes are integrated through adapters instead of hard-wiring one agent implementation into the UI.

## Phase 0 — Fork safety and upstream boundary

- Work only on `matrix-rebuild`.
- Keep upstream event contracts additive until the adapter seam is established.
- Preserve upstream attribution and MIT license notices for MIT-covered code.
- Do **not** ship Matrix World using the StarNet name, logo, station artwork, or sprites. The upstream README explicitly excludes those brand assets from the MIT grant.
- Keep Matrix-specific CSS/docs/modules isolated where practical so future upstream syncs can be reviewed cleanly.

## Phase 1 — Matrix identity + internationalization

- Rename visible product shell to **Matrix World**.
- Introduce a central no-build localization layer.
- Polish is the default UI language.
- English remains the fallback.
- Add an in-app PL/EN switch.
- Migrate dynamic windows from literal strings to translation keys incrementally.
- Later add DE/NL using the same dictionary contract.
- Replace every upstream brand visual before any public Matrix World build.

## Phase 2 — Matrix runtime adapter

Create a normalized adapter contract for:
- agent identity and role,
- current task/state,
- model/provider,
- project/repository/branch,
- tool calls,
- spawned subagents,
- context usage,
- token/cost metrics,
- permissions/approval state,
- artifacts/deliverables,
- logs and failures,
- pause/resume/stop/message/delegate actions.

First-class adapter target: the existing Matrix MCP environment and OpenCode workers.

## Phase 3 — Project rooms

Initial projects:
- RSI Homes
- Mula Group
- Matrix / platform engineering

A room maps to a real project/team boundary, not decoration. Each room can expose:
- active agents,
- repo + branch,
- task queue,
- integrations,
- artifacts,
- costs,
- current blockers,
- recent activity.

## Phase 4 — Operator controls

Per-agent controls:
- MESSAGE
- PAUSE
- RESUME
- STOP
- CHANGE MODEL
- SPAWN SUBAGENT
- DELEGATE
- OPEN TERMINAL / LOG
- OPEN REPO / BRANCH
- APPROVALS

Global controls:
- emergency stop,
- budgets,
- concurrency,
- model routing,
- schedules,
- alerts,
- project health.

## Phase 5 — Matrix visual system

Replace upstream protected artwork with original Matrix World assets:
- wordmark/logo,
- agent sprites/avatars,
- room tiles,
- workstation/tool props,
- backgrounds,
- loading/title art.

Direction: premium technical command center, dark CRT/cockpit vocabulary retained only where useful, with clearer information hierarchy than the original game-first shell.

## Phase 6 — Observability

Live metrics:
- running / waiting / blocked / failed / finished,
- model,
- context utilization,
- input/output/cache tokens,
- cost per run / day / project,
- task duration,
- tool calls,
- error rate,
- queue depth.

Never infer metrics the runtime cannot prove.

## Phase 7 — Quality gates

Before Matrix World is considered usable:
- upstream fast tests still pass or have documented Matrix replacements,
- localization smoke test,
- no visible StarNet branding in distributable UI,
- no protected upstream artwork in distributable UI,
- adapter contract tests,
- multi-agent concurrency test,
- pause/resume/stop test,
- project/repo isolation test,
- secret scan,
- packaged desktop smoke test.

## Current implementation status

- [x] Fork created under `mulasty/Matrix-World`
- [x] `matrix-rebuild` branch created
- [x] Architecture inspected
- [x] Matrix World master plan added
- [x] PL/EN localization foundation started
- [x] Matrix-specific CSS boundary started
- [ ] Complete static-shell Polish translation
- [ ] Translate dynamic windows
- [ ] Replace all protected visual assets
- [ ] Matrix MCP/OpenCode adapter
- [ ] Project rooms
- [ ] Command dashboard
- [ ] Packaging and release
