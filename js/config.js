;(function (root) {
  'use strict';
  const S = root.SCHEDULAB || (root.SCHEDULAB = {});
  const config = Object.freeze({
    maxProcesses: 20,
    rrQuantumFactor: 0.5,
    agingInterval: 5,
    starvationFactor: 2,
    thresholds: Object.freeze({ interactiveFastResponse: 0.25, interactiveAnyObjective: 2 / 3, prioritySpread: 3, burstCV: 0.3, shortJobRatio: 0.5 }),
    weights: Object.freeze({
      waiting: Object.freeze({ WT: 0.60, RT: 0.10, X: 0.20, CS: 0.10 }),
      response: Object.freeze({ WT: 0.10, RT: 0.60, X: 0.10, CS: 0.20 }),
      balanced: Object.freeze({ WT: 0.25, RT: 0.25, X: 0.25, CS: 0.25 }),
      throughput: Object.freeze({ WT: 0.10, RT: 0.10, X: 0.60, CS: 0.20 })
    }),
    policies: Object.freeze(['FCFS', 'SJF', 'Priority', 'RR']),
    policyColors: Object.freeze({ FCFS: '#22D3EE', SJF: '#34D399', Priority: '#FBBF24', RR: '#A78BFA' }),
    processColors: Object.freeze(['#22D3EE', '#34D399', '#FBBF24', '#A78BFA', '#FB7185', '#60A5FA', '#F472B6', '#A3E635', '#FDBA74', '#C4B5FD'])
  });
  S.config = config;
  S.storage = Object.freeze({
    get(key, fallback = null) { try { const value = root.localStorage.getItem(key); return value === null ? fallback : JSON.parse(value); } catch (_) { return fallback; } },
    set(key, value) { try { root.localStorage.setItem(key, JSON.stringify(value)); return true; } catch (_) { return false; } },
    remove(key) { try { root.localStorage.removeItem(key); } catch (_) {} }
  });
  if (typeof module !== 'undefined' && module.exports) module.exports = config;
})(typeof globalThis !== 'undefined' ? globalThis : this);
