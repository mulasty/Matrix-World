/* sidecar/matrix/routes.js — authenticated Matrix World proxy for MATRIX Agent OS read state.
   The browser talks only to Matrix World's already-authenticated /api surface. MATRIX credentials stay
   host-side in client.js and never cross into frontend state. */
'use strict';

function makeMatrixRouteHandlers(deps) {
  deps = deps || {};
  const client = deps.client;
  if (!client) throw new Error('makeMatrixRouteHandlers: client is required');

  const send = typeof deps.respondJson === 'function'
    ? (res, code, body) => deps.respondJson(res, code, body)
    : (res, code, body) => {
        res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
        res.end(JSON.stringify(body));
      };

  function upstreamFailure(res, error) {
    const status = Number(error && error.status) || 0;
    const code = String((error && error.code) || 'matrix_agent_os_unavailable')
      .replace(/[^a-zA-Z0-9._:-]/g, '_')
      .slice(0, 120);
    return send(res, status >= 400 && status < 500 ? status : 503, {
      ok: false,
      connected: false,
      code,
      upstreamStatus: status || null
    });
  }

  function query(req) {
    try { return new URL(req.url || '/', 'http://127.0.0.1').searchParams; }
    catch (_) { return new URLSearchParams(); }
  }

  async function health(req, res) {
    try {
      const [healthState, readyState] = await Promise.all([client.health(), client.ready()]);
      return send(res, 200, {
        ok: true,
        connected: true,
        bridge: client.config(),
        health: healthState,
        ready: readyState
      });
    } catch (error) {
      return upstreamFailure(res, error);
    }
  }

  async function snapshot(req, res) {
    const q = query(req);
    try {
      const data = await client.snapshot(q.get('limit'));
      return send(res, 200, { ok: true, source: 'matrix-agent-os', snapshot: data });
    } catch (error) {
      return upstreamFailure(res, error);
    }
  }

  async function events(req, res) {
    const q = query(req);
    try {
      const data = await client.events({
        limit: q.get('limit'),
        category: q.get('category'),
        severityAtLeast: q.get('severity_at_least'),
        executionId: q.get('execution_id'),
        taskId: q.get('task_id'),
        typePrefix: q.get('type_prefix')
      });
      return send(res, 200, { ok: true, source: 'matrix-agent-os', events: data });
    } catch (error) {
      return upstreamFailure(res, error);
    }
  }

  return { health, snapshot, events };
}

module.exports = { makeMatrixRouteHandlers };
