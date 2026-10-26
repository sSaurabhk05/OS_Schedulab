;(function (root) {
  'use strict';
  const S = root.SCHEDULAB || (root.SCHEDULAB = {});
  const p = (id, arrival, burst, priority, type = 'cpu') => ({ id, arrival, burst, priority, type });
  const presets = [
    { id: 'example', name: 'Worked example', description: 'Reference workload from the project brief.', processes: [p('P1',0,8,3),p('P2',1,4,1,'interactive'),p('P3',2,9,4),p('P4',3,5,2,'interactive')] },
    { id: 'T1', name: 'T1 · Mostly interactive', description: 'Interactive share triggers Round Robin.', processes: [p('P1',0,5,3,'interactive'),p('P2',0,3,2,'interactive'),p('P3',1,4,1,'interactive'),p('P4',2,6,4)] },
    { id: 'T2', name: 'T2 · High burst variance', description: 'High CV and short-job share exercise SJF.', processes: [p('P1',0,1,3),p('P2',0,8,2),p('P3',0,2,1,'interactive'),p('P4',1,15,4)] },
    { id: 'T3', name: 'T3 · Priority variation', description: 'Priority spread exercises R2.', processes: [p('P1',0,7,5),p('P2',1,4,1,'interactive'),p('P3',2,6,8),p('P4',2,3,2,'interactive'),p('P5',5,5,10)] },
    { id: 'T4', name: 'T4 · Similar workload', description: 'Similar bursts exercise the FCFS baseline.', processes: [p('P1',0,6,2),p('P2',2,6,2),p('P3',4,6,2),p('P4',6,6,2)] },
    { id: 'T5', name: 'T5 · Equal arrivals', description: 'Equal arrival times make tie-breaking visible.', processes: [p('P1',0,7,3),p('P2',0,3,1,'interactive'),p('P3',0,5,2),p('P4',0,3,4,'interactive')] },
    { id: 'T6', name: 'T6 · CPU idle gap', description: 'Arrival gaps exercise idle accounting.', processes: [p('P1',0,3,2),p('P2',8,2,1,'interactive'),p('P3',15,4,3)] },
    { id: 'T7', name: 'T7 · Single process', description: 'Boundary case with one process.', processes: [p('P1',0,8,1,'interactive')] },
    { id: 'T8', name: 'T8 · Small RR quantum', description: 'Preemption and queue rotation with q=1.', quantum: 1, processes: [p('P1',0,6,2),p('P2',0,4,1,'interactive'),p('P3',1,5,3),p('P4',2,3,2,'interactive')] },
    { id: 'T9', name: 'T9 · Starvation and aging', description: 'Aging promotes a long-waiting low-priority process.', processes: [p('P1',0,5,1),p('P2',5,5,1),p('P3',10,5,1),p('P4',15,5,1),p('P5',20,5,1),p('P6',25,5,1),p('P7',30,5,1),p('P8',35,5,1),p('P9',40,5,1),p('P10',45,5,1),p('P11',0,2,8,'interactive')] }
  ];
  const api = { presets, getPreset(id) { const item = presets.find(x => x.id === id); return item ? item.processes.map(p => ({ ...p })) : null; } };
  Object.assign(S, api);
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
