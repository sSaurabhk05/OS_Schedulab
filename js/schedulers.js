;(function (root) {
  'use strict';
  const S = root.SCHEDULAB || (root.SCHEDULAB = {});
  if (!S.config && typeof require === 'function') require('./config.js');
  function run(policy, workload, options = {}) {
    if (!S.config.policies.includes(policy)) throw new Error(`Unknown policy: ${policy}`);
    const quantum = Math.max(1, Math.floor(Number(options.quantum) || S.config.rrQuantumFactor * workload.reduce((a, p) => a + p.burst, 0) / workload.length));
    const aging = Boolean(options.aging), dt = S.config.agingInterval;
    const jobs = workload.map((p, index) => ({ ...p, id: String(p.id), arrival: Number(p.arrival), burst: Number(p.burst), priority: Number(p.priority), index, remaining: Number(p.burst), firstStart: null, completion: null }));
    const segments = [], dispatches = [];
    let time = 0, complete = 0, readyQueue = [], enqueued = new Set();
    const record = (job, start, end, queue, remainingBefore) => {
      segments.push({ pid: job.id, start, end, readyQueue: queue.slice(), remainingBefore, remainingAfter: job.remaining });
      dispatches.push({ time: start, running: job.id, ready: queue.slice() });
    };
    const nextArrival = () => Math.min(...jobs.filter(j => j.remaining > 0 && !enqueued.has(j.id) && !readyQueue.includes(j)).map(j => j.arrival));
    const enqueueThrough = (limit, excludeId = null) => jobs.filter(j => j.remaining > 0 && j.id !== excludeId && !enqueued.has(j.id) && j.arrival <= limit)
      .sort((a, b) => a.arrival - b.arrival || a.index - b.index)
      .forEach(j => { readyQueue.push(j); enqueued.add(j.id); });
    const choose = (available) => {
      if (policy === 'SJF') return available.sort((a, b) => a.burst - b.burst || a.arrival - b.arrival || a.index - b.index)[0];
      if (policy === 'Priority') return available.sort((a, b) => {
        const pa = aging ? Math.max(1, a.priority - Math.floor(Math.max(0, time - a.arrival) / dt)) : a.priority;
        const pb = aging ? Math.max(1, b.priority - Math.floor(Math.max(0, time - b.arrival) / dt)) : b.priority;
        return pa - pb || a.arrival - b.arrival || a.index - b.index;
      })[0];
      return available.sort((a, b) => a.arrival - b.arrival || a.index - b.index)[0];
    };
    while (complete < jobs.length) {
      if (policy === 'RR') {
        enqueueThrough(time);
        if (!readyQueue.length) {
          const arrival = nextArrival();
          if (!Number.isFinite(arrival)) throw new Error('No remaining process can be scheduled.');
          if (arrival > time) segments.push({ pid: 'IDLE', start: time, end: arrival, readyQueue: [] });
          time = arrival; enqueueThrough(time);
        }
        const job = readyQueue.shift(); enqueued.delete(job.id);
        const before = job.remaining, start = time;
        if (job.firstStart === null) job.firstStart = start;
        const end = start + Math.min(quantum, job.remaining);
        job.remaining -= end - start; time = end;
        enqueueThrough(time, job.id); // Boundary arrivals enter before the expired job.
        record(job, start, end, readyQueue.map(j => j.id), before);
        if (job.remaining === 0) { job.completion = time; complete++; }
        else { readyQueue.push(job); enqueued.add(job.id); }
      } else {
        const available = jobs.filter(j => j.remaining > 0 && j.arrival <= time);
        if (!available.length) {
          const arrival = Math.min(...jobs.filter(j => j.remaining > 0).map(j => j.arrival));
          if (arrival > time) segments.push({ pid: 'IDLE', start: time, end: arrival, readyQueue: [] });
          time = arrival;
          continue;
        }
        const job = choose(available), start = time, before = job.remaining;
        const queue = available.filter(j => j !== job).sort((a, b) => a.arrival - b.arrival || a.index - b.index).map(j => j.id);
        if (job.firstStart === null) job.firstStart = start;
        time += job.remaining; job.remaining = 0; job.completion = time; complete++;
        record(job, start, time, queue, before);
      }
      if (dispatches.length > 100000) throw new Error('Schedule exceeded the safety limit.');
    }
    return { policy, quantum: policy === 'RR' ? quantum : null, aging, segments, dispatches, processes: jobs };
  }
  const api = { run };
  Object.assign(S, api);
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
