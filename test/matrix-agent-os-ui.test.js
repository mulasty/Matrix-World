/* node test/matrix-agent-os-ui.test.js — pure projection contract for the Matrix World topbar source. */
'use strict';
const A = require('./_assert.js');
const M = require('../frontend/app/matrix-agent-os.js');

(() => {
  const p = M.projectSnapshot({
    snapshot: {
      protocolVersion: '3.0',
      health: { status: 'warning', activeExecutions: 2, knownExecutions: 8, warnings: 1, failures: 0, critical: 0 },
      events: { buffered: 77 },
      executions: {
        active: [
          { executionId: 'e1', agents: ['dev', 'qa'] },
          { executionId: 'e2', agents: ['dev', 'research'] }
        ],
        recent: [{ executionId: 'e2' }]
      }
    }
  });
  A.eq(p.protocolVersion, '3.0', 'protocol version projected');
  A.eq(p.status, 'warning', 'health status projected without invention');
  A.eq(p.activeExecutions, 2, 'active execution count projected');
  A.eq(p.knownExecutions, 8, 'known execution count projected');
  A.eq(p.bufferedEvents, 77, 'event count projected');
  A.eq(p.activeAgents.sort(), ['dev', 'qa', 'research'], 'active agents are deduplicated from real execution evidence');
  A.eq(p.recent[0].executionId, 'e2', 'recent execution projection preserved');

  const empty = M.projectSnapshot({});
  A.eq(empty.status, 'unknown', 'missing truth stays unknown');
  A.eq(empty.activeExecutions, 0, 'missing activity does not invent work');
  A.eq(empty.activeAgents, [], 'missing agents stays empty');

  A.report('matrix-agent-os-ui.test');
})();
