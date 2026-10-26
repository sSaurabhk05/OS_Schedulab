;(function (root) {
  'use strict';
  const S = root.SCHEDULAB || (root.SCHEDULAB = {});
  if (!S.config && typeof require === 'function') require('./config.js');
  function analyze(processes) {
    const n = processes.length;
    if (!n) return { n: 0, meanBurst: 0, cv: 0, interactiveRatio: 0, shortJobRatio: 0, prioritySpread: 0, arrivalSpread: 0, quantum: 1 };
    const bursts = processes.map(p => Number(p.burst));
    const meanBurst = bursts.reduce((a, b) => a + b, 0) / n;
    const variance = bursts.reduce((sum, value) => sum + (value - meanBurst) ** 2, 0) / n;
    const priorities = processes.map(p => Number(p.priority));
    const arrivals = processes.map(p => Number(p.arrival));
    return {
      n, meanBurst, cv: meanBurst ? Math.sqrt(variance) / meanBurst : 0,
      interactiveRatio: processes.filter(p => p.type === 'interactive').length / n,
      shortJobRatio: bursts.filter(b => b < meanBurst).length / n,
      prioritySpread: Math.max(...priorities) - Math.min(...priorities),
      arrivalSpread: Math.max(...arrivals) - Math.min(...arrivals),
      quantum: Math.max(1, Math.round(S.config.rrQuantumFactor * meanBurst))
    };
  }
  const api = { analyze };
  Object.assign(S, api);
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
