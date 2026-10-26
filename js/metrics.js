;(function (root) {
  'use strict';
  const S = root.SCHEDULAB || (root.SCHEDULAB = {});
  if (!S.config && typeof require === 'function') require('./config.js');
  function measure(schedule, workload) {
    const n = workload.length, stats = schedule.processes.map(p => {
      const firstStart = p.firstStart;
      const completion = p.completion;
      return { id: p.id, arrival: p.arrival, burst: p.burst, priority: p.priority, type: p.type, firstStart, completion, CT: completion, TAT: completion - p.arrival, WT: completion - p.arrival - p.burst, RT: firstStart - p.arrival };
    });
    const totalTime = Math.max(0, ...stats.map(p => p.completion));
    const busyTime = workload.reduce((sum, p) => sum + Number(p.burst), 0);
    let contextSwitches = 0, previous = null;
    for (const segment of schedule.segments) {
      if (segment.pid === 'IDLE') { previous = null; continue; }
      if (previous !== null && previous !== segment.pid) contextSwitches++;
      previous = segment.pid;
    }
    const meanWT = stats.reduce((sum, p) => sum + p.WT, 0) / n;
    stats.forEach(p => { p.starvation = p.WT > S.config.starvationFactor * meanWT && p.WT > 0; });
    const avg = key => stats.reduce((sum, p) => sum + p[key], 0) / n;
    return { ...schedule, processes: stats, avgWT: avg('WT'), avgTAT: avg('TAT'), avgRT: avg('RT'), utilization: totalTime ? busyTime / totalTime * 100 : 0, throughput: totalTime ? n / totalTime : 0, contextSwitches, totalTime, busyTime };
  }
  const api = { measure };
  Object.assign(S, api);
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
