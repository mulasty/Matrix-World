/* frontend/app/matrix-agent-os.js — live MATRIX Agent OS projection for Matrix World.
   Read-only. The sidecar owns credentials and proxies canonical Event Protocol state. */
'use strict';

(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) module.exports = factory(null);
  else root.MatrixAgentOS = factory(root);
})(typeof window !== 'undefined' ? window : null, function (root) {
  const state = {
    connected: false,
    loading: false,
    health: null,
    snapshot: null,
    projection: null,
    error: null,
    updatedAt: 0
  };
  const listeners = new Set();
  let timer = null;
  let started = false;

  function uniqueActiveAgents(active) {
    const ids = new Set();
    for (const execution of Array.isArray(active) ? active : []) {
      for (const id of Array.isArray(execution && execution.agents) ? execution.agents : []) {
        if (id) ids.add(String(id));
      }
    }
    return Array.from(ids);
  }

  function projectSnapshot(payload) {
    const snap = payload && payload.snapshot ? payload.snapshot : (payload || {});
    const health = snap.health && typeof snap.health === 'object' ? snap.health : {};
    const executions = snap.executions && typeof snap.executions === 'object' ? snap.executions : {};
    const events = snap.events && typeof snap.events === 'object' ? snap.events : {};
    const active = Array.isArray(executions.active) ? executions.active : [];
    return {
      protocolVersion: String(snap.protocolVersion || ''),
      status: String(health.status || 'unknown'),
      activeExecutions: Number.isFinite(Number(health.activeExecutions)) ? Number(health.activeExecutions) : active.length,
      knownExecutions: Number.isFinite(Number(health.knownExecutions)) ? Number(health.knownExecutions) : 0,
      warnings: Number(health.warnings) || 0,
      failures: Number(health.failures) || 0,
      critical: Number(health.critical) || 0,
      bufferedEvents: Number(events.buffered) || 0,
      activeAgents: uniqueActiveAgents(active),
      active,
      recent: Array.isArray(executions.recent) ? executions.recent : []
    };
  }

  function snapshotState() {
    return {
      connected: state.connected,
      loading: state.loading,
      health: state.health,
      snapshot: state.snapshot,
      projection: state.projection,
      error: state.error,
      updatedAt: state.updatedAt
    };
  }

  function emit() {
    const snap = snapshotState();
    for (const fn of listeners) {
      try { fn(snap); } catch (_) {}
    }
    if (root && typeof root.CustomEvent === 'function') {
      try { root.dispatchEvent(new root.CustomEvent('matrix:agent-os-state', { detail: snap })); } catch (_) {}
    }
  }

  async function getJson(path) {
    const response = await root.fetch(path, { method: 'GET', cache: 'no-store', headers: { accept: 'application/json' } });
    let body = null;
    try { body = await response.json(); } catch (_) {}
    if (!response.ok || !body || body.ok === false) {
      const err = new Error((body && body.code) || ('http_' + response.status));
      err.status = response.status;
      throw err;
    }
    return body;
  }

  async function refresh() {
    if (!root || typeof root.fetch !== 'function' || state.loading) return snapshotState();
    state.loading = true;
    emit();
    try {
      const health = await getJson('/api/matrix/health');
      const snapshot = await getJson('/api/matrix/snapshot?limit=500');
      state.connected = true;
      state.health = health;
      state.snapshot = snapshot.snapshot || null;
      state.projection = projectSnapshot(snapshot);
      state.error = null;
      state.updatedAt = Date.now();
    } catch (error) {
      state.connected = false;
      state.error = String((error && error.message) || error || 'matrix_unavailable');
      state.updatedAt = Date.now();
    } finally {
      state.loading = false;
      emit();
    }
    return snapshotState();
  }

  function locale() {
    try {
      return root.MatrixI18n && root.MatrixI18n.getLocale ? root.MatrixI18n.getLocale() : 'pl';
    } catch (_) { return 'pl'; }
  }

  function paintChip(s) {
    if (!root || !root.document) return;
    const chip = root.document.getElementById('mw-agent-os-status');
    if (!chip) return;
    const p = s.projection;
    chip.classList.toggle('is-online', !!s.connected && (!p || p.status === 'healthy'));
    chip.classList.toggle('is-warning', !!s.connected && !!p && (p.status === 'warning' || p.status === 'degraded'));
    chip.classList.toggle('is-offline', !s.connected);

    const dot = chip.querySelector('.mw-aos-dot');
    const label = chip.querySelector('.mw-aos-label');
    if (!label) return;

    const pl = locale() === 'pl';
    if (!s.connected) {
      label.textContent = pl ? 'MATRIX • OFFLINE' : 'MATRIX • OFFLINE';
      chip.title = pl ? 'MATRIX Agent OS nie jest połączony' : 'MATRIX Agent OS is not connected';
    } else {
      const active = p ? p.activeExecutions : 0;
      label.textContent = active > 0
        ? 'MATRIX • ' + active + (pl ? ' AKTYWNE' : ' ACTIVE')
        : (pl ? 'MATRIX • ONLINE' : 'MATRIX • ONLINE');
      const status = p ? p.status : 'unknown';
      chip.title = (pl ? 'MATRIX Agent OS — stan: ' : 'MATRIX Agent OS — status: ') + status +
        (p ? (pl ? ', aktywne misje: ' : ', active missions: ') + p.activeExecutions : '');
    }
    if (dot) dot.setAttribute('aria-hidden', 'true');
  }

  function mount() {
    if (!root || !root.document || root.document.getElementById('mw-agent-os-status')) return;
    const stats = root.document.querySelector('#topbar .tb-stats');
    if (!stats) return;
    const chip = root.document.createElement('button');
    chip.type = 'button';
    chip.id = 'mw-agent-os-status';
    chip.className = 'mw-agent-os-status is-offline';
    chip.setAttribute('aria-label', 'MATRIX Agent OS status');
    chip.innerHTML = '<span class="mw-aos-dot" aria-hidden="true"></span><span class="mw-aos-label">MATRIX • …</span>';
    chip.addEventListener('click', () => {
      refresh();
      try { root.dispatchEvent(new root.CustomEvent('matrix:agent-os-open', { detail: snapshotState() })); } catch (_) {}
    });
    stats.insertBefore(chip, stats.firstChild);
    subscribe(paintChip);
  }

  function schedule() {
    if (!root || timer) return;
    timer = root.setInterval(() => {
      if (!root.document || root.document.visibilityState !== 'hidden') refresh();
    }, 5000);
  }

  function start() {
    if (started || !root || !root.document) return;
    started = true;
    mount();
    refresh();
    schedule();
    root.addEventListener('matrix:locale-change', () => paintChip(snapshotState()));
    root.document.addEventListener('visibilitychange', () => {
      if (root.document.visibilityState === 'visible') refresh();
    });
  }

  function subscribe(fn) {
    if (typeof fn !== 'function') return () => {};
    listeners.add(fn);
    try { fn(snapshotState()); } catch (_) {}
    return () => listeners.delete(fn);
  }

  const api = {
    refresh,
    subscribe,
    getState: snapshotState,
    projectSnapshot,
    start
  };

  if (root && root.document) {
    if (root.document.readyState === 'loading') root.document.addEventListener('DOMContentLoaded', start, { once: true });
    else start();
  }
  return api;
});
