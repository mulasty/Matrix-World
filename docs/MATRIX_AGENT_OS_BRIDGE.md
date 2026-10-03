# Matrix World ↔ MATRIX Agent OS Bridge

## Decision

**MATRIX Agent OS remains the source of truth and the only orchestrator.**

Matrix World is the operator/visualization surface. It does not create a second mission engine, approval authority, or competing computer-use owner.

## Local topology

| Service | Default | Purpose |
| --- | --- | --- |
| Matrix World sidecar | `127.0.0.1:8787` | UI backend, local station runtime, connector host |
| MATRIX local/legacy API | `127.0.0.1:8788` | compatibility/local data API when launched beside Matrix World |
| MATRIX Mission Control | `127.0.0.1:8790` | Event Protocol 3.0 read plane |
| MATRIX MCP | stdio | governed control plane |

When launching `npm run mission-control` in `mulasty/matrix-mcp` beside Matrix World, set:

```env
MATRIX_API_PORT=8788
MATRIX_MISSION_CONTROL_PORT=8790
```

Matrix World's own sidecar can remain on its upstream-compatible port `8787`.

## Read plane: Mission Control / Event Protocol 3.0

Matrix World reads canonical state from MATRIX:

- `GET /api/health`
- `GET /api/ready`
- `GET /api/mission-control/snapshot?limit=...`
- `GET /api/events?...filters...`
- next: `GET /api/events/stream` (SSE, event name `matrix`)

The first bridge client lives at:

`sidecar/matrix/client.js`

Default Mission Control URL:

`http://127.0.0.1:8790`

Override:

```env
MATRIX_AGENT_OS_MISSION_CONTROL_URL=http://127.0.0.1:8790
MATRIX_AGENT_OS_TOKEN=...
```

`MATRIX_API_TOKEN` is also accepted as a compatibility fallback.

### Security boundary

The MATRIX token stays in the Matrix World **sidecar**. It must never be serialized into frontend state, localStorage, UI logs, or agent context. The bridge attaches it to protected Mission Control reads as `x-matrix-token`.

## Control plane: MCP

Actions remain in MATRIX's existing governed MCP tools, especially:

`matrix_operator`

Supported operator actions currently include:

- `turn`
- `status`
- `plan`
- `cancel`
- `missions`
- `approve`
- `deny`
- `listen`
- `say`

Matrix World already has an MCP connector manager with stdio support. The intended control integration is therefore:

```
Matrix World UI
  -> Matrix World sidecar
    -> existing MCP connector manager
      -> matrix-mcp/dist/index.js
        -> MATRIX policy / execution / evidence / approval
```

No direct browser-to-MATRIX control calls.

## Hermes boundary

The existing MATRIX rule remains authoritative:

- MATRIX is the orchestrator.
- Hermes is a capability backend / optional UI.
- MATRIX owns computer-use.
- MATRIX owns the mission store and approval gate.
- Never let Matrix World create a second Hermes control path that bypasses MATRIX.

## Projection into Matrix World

Event Protocol identifiers map naturally into the visual world:

| MATRIX field/event | Matrix World projection |
| --- | --- |
| `executionId` | mission/run |
| `taskId` | task card / activity |
| `agentId` | agent/avatar |
| `workerId` | worker runtime |
| `model` | model badge |
| `repository` | project/repo room |
| `task.started` | working |
| `task.verifying` | verifying |
| `task.retrying` | retry/warning |
| `task.succeeded` | completed |
| `task.failed` | failed |
| `task.cancelled` | stopped |
| `execution.*` | mission lifecycle |
| `verification.*` | evidence/QA |
| `artifact.*` | deliverable/output |

The UI must display `unknown` / disconnected / stale where MATRIX has not provided a fact. It must not synthesize model, cost, progress, or completion.

## Next implementation slice

1. Add sidecar proxy endpoints backed by `sidecar/matrix/client.js`.
2. Add SSE bridge with reconnect and last-good state.
3. Register `matrix-mcp` as a first-class local MCP connector.
4. Build a Matrix projection store in the frontend.
5. Bind live MATRIX agents/tasks to the existing world renderer.
6. Add operator actions: cancel, approve/deny, message/turn, status.
7. Add project-room mapping for RSI Homes / Mula Group / Matrix.
