;(function (root) {
  'use strict';
  const S = root.SCHEDULAB || (root.SCHEDULAB = {});
  if (!S.config && typeof require === 'function') require('./config.js');
  function select(profile, objective, respectPriority) {
    const t = S.config.thresholds, ratio = profile.interactiveRatio;
    const trace = [];
    const responseRule = objective === 'response' && ratio >= t.interactiveFastResponse;
    const allObjectiveRule = ratio >= t.interactiveAnyObjective;
    trace.push({ id: 'R1', passed: responseRule || allObjectiveRule, measured: `ρI=${ratio.toFixed(2)}`, threshold: objective === 'response' ? `response ≥ ${t.interactiveFastResponse} or any objective ≥ ${t.interactiveAnyObjective}` : `ρI ≥ ${t.interactiveAnyObjective}`, explanation: 'Interactive processes benefit from frequent CPU access.' });
    if (responseRule || allObjectiveRule) return { policy: 'RR', rule: 'R1', trace, reason: `The interactive share is ${ratio.toFixed(2)}. Round Robin gives interactive work repeated opportunities to run.` };
    const priority = respectPriority && profile.prioritySpread >= t.prioritySpread;
    trace.push({ id: 'R2', passed: priority, measured: `Δπ=${profile.prioritySpread}`, threshold: `Δπ ≥ ${t.prioritySpread}${respectPriority ? '' : ' (priority respect is off)'}`, explanation: 'A wide priority range is meaningful when priority respect is enabled.' });
    if (priority) return { policy: 'Priority', rule: 'R2', trace, reason: `Priority spread Δπ=${profile.prioritySpread} reaches the configured threshold, and priority respect is enabled.` };
    const sjf = profile.cv >= t.burstCV && profile.shortJobRatio >= t.shortJobRatio;
    trace.push({ id: 'R3', passed: sjf, measured: `CV=${profile.cv.toFixed(3)}, ρS=${profile.shortJobRatio.toFixed(2)}`, threshold: `CV ≥ ${t.burstCV} and ρS ≥ ${t.shortJobRatio}`, explanation: 'Variable bursts and a substantial share of short jobs can favor shortest-first scheduling.' });
    if (sjf) return { policy: 'SJF', rule: 'R3', trace, reason: `Burst variability CV=${profile.cv.toFixed(3)} and short-job share ρS=${profile.shortJobRatio.toFixed(2)} both meet their thresholds.` };
    trace.push({ id: 'R4', passed: true, measured: 'No earlier rule matched', threshold: 'Fallback', explanation: 'Use the deterministic arrival-order baseline.' });
    return { policy: 'FCFS', rule: 'R4', trace, reason: 'No specialist rule matched, so the engine selects FCFS as its predictable baseline.' };
  }
  function evaluate(workload, options = {}) {
    const profile = S.analyze(workload), objective = options.objective || 'waiting';
    const rule = select(profile, objective, Boolean(options.respectPriority));
    const quantum = Number.isInteger(options.quantum) && options.quantum > 0 ? options.quantum : profile.quantum;
    const all = S.config.policies.map(policy => S.measure(S.run(policy, workload, { quantum, aging: options.aging }), workload));
    const board = S.score(all, objective), ruleResult = board.results.find(r => r.policy === rule.policy);
    return { profile, objective, quantum, rule, ruleResult, recommendation: board.best, best: board.best, tied: board.tied, regret: Math.max(0, board.best.score - ruleResult.score), policies: board.results };
  }
  const api = { select, evaluate };
  Object.assign(S, api);
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
