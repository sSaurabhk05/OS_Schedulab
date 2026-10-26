;(function (root) {
  'use strict';
  const S = root.SCHEDULAB || (root.SCHEDULAB = {});
  if (!S.config && typeof require === 'function') { require('./config.js'); }
  function validateProcesses(input, limit = S.config.maxProcesses) {
    const errors = [];
    if (!Array.isArray(input) || input.length < 1) return { valid: false, errors: [{ index: -1, field: 'processes', message: 'Add at least one process to continue.' }] };
    if (input.length > limit) errors.push({ index: -1, field: 'processes', message: `A workload can contain at most ${limit} processes.` });
    const ids = new Map();
    input.forEach((p, index) => {
      const id = String(p.id ?? '').trim();
      if (!id) errors.push({ index, field: 'id', message: 'Enter a process ID.' });
      else if (ids.has(id.toLowerCase())) errors.push({ index, field: 'id', message: `Process ID “${id}” is already used.` });
      else ids.set(id.toLowerCase(), index);
      for (const [field, label, min] of [['arrival', 'Arrival time', 0], ['burst', 'CPU burst', 1], ['priority', 'Priority', 1]]) {
        const value = Number(p[field]);
        if (!Number.isInteger(value) || value < min) errors.push({ index, field, message: `${label} must be an integer ≥ ${min}.` });
      }
      if (!['interactive', 'cpu'].includes(p.type)) errors.push({ index, field: 'type', message: 'Choose Interactive or CPU-bound.' });
    });
    return { valid: errors.length === 0, errors };
  }
  const api = { validateProcesses };
  Object.assign(S, api);
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
