/* sidecar/matrix/client.js — Matrix World read-plane adapter for MATRIX Agent OS.
   MATRIX remains the source of truth. This client only reads its Mission Control/Event Protocol API.
   Mutating/operator commands intentionally stay on MATRIX's governed MCP control plane.

   Default topology:
     Matrix World sidecar      127.0.0.1:8787
     MATRIX legacy/local API   127.0.0.1:8788
     MATRIX Mission Control    127.0.0.1:8790

   The MATRIX_API_TOKEN never enters the browser. It lives here, on the host side, and is attached
   as x-matrix-token only on the outbound loopback request. */
'use strict';

const http = require('http');
const https = require('https');

const DEFAULT_BASE_URL = 'http://127.0.0.1:8790';
const DEFAULT_TIMEOUT_MS = 5000;
const MAX_JSON_BYTES = 5 * 1024 * 1024;

function positiveInt(value, fallback, min, max) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Math.round(n)));
}

function readConfig(env) {
  env = env || process.env || {};
  const rawUrl = String(
    env.MATRIX_AGENT_OS_MISSION_CONTROL_URL ||
    env.MATRIX_MISSION_CONTROL_URL ||
    DEFAULT_BASE_URL
  ).trim();
  let base;
  try { base = new URL(rawUrl); }
  catch (_) { throw new Error('invalid MATRIX Mission Control URL'); }
  if (base.protocol !== 'http:' && base.protocol !== 'https:') {
    throw new Error('MATRIX Mission Control URL must use http or https');
  }
  base.pathname = base.pathname.replace(/\/+$/, '') || '/';
  base.search = '';
  base.hash = '';

  return {
    baseUrl: base.href.replace(/\/$/, ''),
    token: String(env.MATRIX_AGENT_OS_TOKEN || env.MATRIX_API_TOKEN || '').trim(),
    timeoutMs: positiveInt(env.MATRIX_AGENT_OS_TIMEOUT_MS, DEFAULT_TIMEOUT_MS, 500, 60000)
  };
}

function publicConfig(cfg) {
  let origin = '<invalid>';
  try { origin = new URL(cfg.baseUrl).origin; } catch (_) {}
  return {
    origin,
    configured: !!cfg.baseUrl,
    authenticated: !!cfg.token,
    timeoutMs: cfg.timeoutMs
  };
}

function safeRemoteError(status, parsed) {
  const code = parsed && typeof parsed === 'object' && typeof parsed.error === 'string'
    ? parsed.error.replace(/[^a-zA-Z0-9._:-]/g, '_').slice(0, 120)
    : 'request_failed';
  const err = new Error('MATRIX Agent OS request failed (' + status + ': ' + code + ')');
  err.status = status;
  err.code = code;
  return err;
}

function nodeRequestJson(opts) {
  return new Promise((resolve, reject) => {
    let url;
    try { url = new URL(opts.url); }
    catch (_) { reject(new Error('invalid MATRIX Agent OS request URL')); return; }

    const transport = url.protocol === 'https:' ? https : http;
    const req = transport.request(url, {
      method: opts.method || 'GET',
      headers: opts.headers || {},
      timeout: opts.timeoutMs || DEFAULT_TIMEOUT_MS
    }, res => {
      const chunks = [];
      let bytes = 0;
      res.on('data', chunk => {
        const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
        bytes += buf.length;
        if (bytes > MAX_JSON_BYTES) {
          req.destroy(new Error('MATRIX Agent OS response exceeded JSON limit'));
          return;
        }
        chunks.push(buf);
      });
      res.on('end', () => {
        if (req.destroyed && bytes > MAX_JSON_BYTES) return;
        const raw = Buffer.concat(chunks).toString('utf8');
        let parsed = {};
        if (raw.trim()) {
          try { parsed = JSON.parse(raw); }
          catch (_) { reject(new Error('MATRIX Agent OS returned invalid JSON')); return; }
        }
        const status = Number(res.statusCode) || 0;
        if (status < 200 || status >= 300) {
          reject(safeRemoteError(status, parsed));
          return;
        }
        resolve(parsed);
      });
    });
    req.on('timeout', () => req.destroy(new Error('MATRIX Agent OS request timed out')));
    req.on('error', err => reject(err));
    if (opts.body != null) req.write(typeof opts.body === 'string' ? opts.body : JSON.stringify(opts.body));
    req.end();
  });
}

function appendQuery(url, values) {
  const out = new URL(url);
  for (const [key, value] of Object.entries(values || {})) {
    if (value == null || value === '') continue;
    out.searchParams.set(key, String(value));
  }
  return out.href;
}

function makeMatrixAgentOsClient(options) {
  options = options || {};
  const cfg = Object.assign(readConfig(options.env), options.config || {});
  const requestImpl = options.requestImpl || nodeRequestJson;

  function request(path, query, auth) {
    const base = new URL(cfg.baseUrl + '/');
    const target = new URL(String(path || '').replace(/^\/+/, ''), base);
    if (target.origin !== base.origin) throw new Error('cross-origin MATRIX Agent OS request refused');
    const headers = { accept: 'application/json' };
    if (auth !== false && cfg.token) headers['x-matrix-token'] = cfg.token;
    return requestImpl({
      method: 'GET',
      url: appendQuery(target.href, query),
      headers,
      timeoutMs: cfg.timeoutMs
    });
  }

  return {
    config: () => publicConfig(cfg),

    health: () => request('/api/health', null, false),

    ready: () => request('/api/ready', null, false),

    snapshot(limit) {
      return request('/api/mission-control/snapshot', {
        limit: positiveInt(limit, 500, 1, 2000)
      }, true);
    },

    events(filters) {
      filters = filters || {};
      return request('/api/events', {
        limit: positiveInt(filters.limit, 200, 1, 2000),
        category: filters.category,
        severity_at_least: filters.severityAtLeast,
        execution_id: filters.executionId,
        task_id: filters.taskId,
        type_prefix: filters.typePrefix
      }, true);
    }
  };
}

module.exports = {
  DEFAULT_BASE_URL,
  DEFAULT_TIMEOUT_MS,
  MAX_JSON_BYTES,
  readConfig,
  publicConfig,
  makeMatrixAgentOsClient,
  _internals: { positiveInt, appendQuery, safeRemoteError, nodeRequestJson }
};
