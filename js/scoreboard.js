;(function (root) {
  'use strict';
  const S = root.SCHEDULAB || (root.SCHEDULAB = {});
  if (!S.config && typeof require === 'function') require('./config.js');
  const lowerIsBetter = Object.freeze({ WT: true, RT: true, X: false, CS: true });
  function score(results, objective) {
    const weights = S.config.weights[objective];
    if (!weights) throw new Error(`Unknown objective: ${objective}`);
    const normalized = {};
    for (const metric of Object.keys(weights)) {
      const values = results.map(r => metric === 'X' ? r.throughput : metric === 'CS' ? r.contextSwitches : metric === 'WT' ? r.avgWT : r.avgRT);
      const min = Math.min(...values), max = Math.max(...values);
      normalized[metric] = results.map((r, i) => max === min ? 1 : lowerIsBetter[metric] ? (max - values[i]) / (max - min) : (values[i] - min) / (max - min));
    }
    const scored = results.map((r, i) => ({ ...r, normalized: Object.fromEntries(Object.keys(weights).map(k => [k, normalized[k][i]])), score: 100 * Object.keys(weights).reduce((sum, k) => sum + weights[k] * normalized[k][i], 0) }));
    const bestScore = Math.max(...scored.map(r => r.score));
    const tied = scored.filter(r => Math.abs(r.score - bestScore) < 1e-8);
    return { results: scored, best: tied[0], tied, normalized };
  }
  const api = { score };
  Object.assign(S, api);
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
