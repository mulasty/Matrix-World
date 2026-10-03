/* node test/matrix-agent-os-routes.test.js — browser-safe proxy contract. */
'use strict';
const A = require('./_assert.js');
const { makeMatrixRouteHandlers } = require('../sidecar/matrix/routes.js');

function response() {
  return {
    code: 0, body: null,
    writeHead(code) { this.code = code; },
    end(raw) { this.body = JSON.parse(String(raw || '{}')); }
  };
}

(async () => {
  const calls = [];
  const client = {
    config: () => ({ origin: 'http://127.0.0.1:8790', authenticated: true, timeoutMs: 5000 }),
    health: async () => ({ ok: true, service: 'matrix-mission-control' }),
    ready: async () => ({ ok: true }),
    snapshot: async limit => { calls.push(['snapshot', limit]); return { executions: [] }; },
    events: async filters => { calls.push(['events', filters]); return { events: [] }; }
  };
  const h = makeMatrixRouteHandlers({ client });

  {
    const res = response();
    await h.health({ url: '/api/matrix/health' }, res);
    A.eq(res.code, 200, 'health proxy succeeds');
    A.eq(res.body.connected, true, 'health reports a real connection');
    A.eq(res.body.bridge.authenticated, true, 'bridge may expose that auth exists');
    A.ok(JSON.stringify(res.body).indexOf('token') < 0, 'bridge response contains no token field or bytes');
  }

  {
    const res = response();
    await h.snapshot({ url: '/api/matrix/snapshot?limit=321' }, res);
    A.eq(res.code, 200, 'snapshot proxy succeeds');
    A.eq(calls[0][0], 'snapshot', 'snapshot delegates to the Matrix client');
    A.eq(calls[0][1], '321', 'snapshot forwards the requested limit for client-side clamping');
    A.eq(res.body.source, 'matrix-agent-os', 'snapshot identifies its authority');
  }

  {
    const res = response();
    await h.events({
      url: '/api/matrix/events?limit=12&category=task&severity_at_least=warning&execution_id=e1&task_id=t1&type_prefix=task.'
    }, res);
    A.eq(res.code, 200, 'event proxy succeeds');
    const filters = calls[1][1];
    A.eq(filters.limit, '12', 'event limit forwarded');
    A.eq(filters.category, 'task', 'category forwarded');
    A.eq(filters.severityAtLeast, 'warning', 'severity forwarded');
    A.eq(filters.executionId, 'e1', 'execution id forwarded');
    A.eq(filters.taskId, 't1', 'task id forwarded');
    A.eq(filters.typePrefix, 'task.', 'type prefix forwarded');
  }

  {
    const failing = makeMatrixRouteHandlers({
      client: {
        config: () => ({}),
        health: async () => { const e = new Error('secret should not cross'); e.status = 401; e.code = 'unauthorized'; throw e; },
        ready: async () => ({ ok: true }),
        snapshot: async () => ({}),
        events: async () => ({})
      }
    });
    const res = response();
    await failing.health({ url: '/api/matrix/health' }, res);
    A.eq(res.code, 401, 'upstream 4xx is preserved');
    A.eq(res.body.code, 'unauthorized', 'safe upstream code is retained');
    A.ok(JSON.stringify(res.body).indexOf('secret should not cross') < 0, 'upstream error detail is not reflected');
  }

  A.report('matrix-agent-os-routes.test');
})().catch(err => { console.error(err && err.stack ? err.stack : err); process.exit(1); });
