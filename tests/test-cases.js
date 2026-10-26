;(function (root) {
  'use strict';
  const S = root.SCHEDULAB || (root.SCHEDULAB = {});
  if (typeof module !== 'undefined' && module.exports) {
    require('../js/config.js'); require('../js/validator.js'); require('../js/analyzer.js'); require('../js/schedulers.js'); require('../js/metrics.js'); require('../js/scoreboard.js'); require('../js/engine.js'); require('../js/presets.js');
  }
  const expected = {
    T1: { policy: 'RR', rule: 'R1', avgWT: 9.25, avgTAT: 13.75, avgRT: 2.25, switches: 9, finish: 18, gantt: 'P1 P2 P3 P4 P1 P2 P3 P4 P1 P4' },
    T2: { policy: 'SJF', rule: 'R3', avgWT: 3.5, avgTAT: 10, avgRT: 3.5, switches: 3, finish: 26, gantt: 'P1 P3 P2 P4' },
    T3: { policy: 'Priority', rule: 'R2', avgWT: 8.4, avgTAT: 13.4, avgRT: 8.4, switches: 4, finish: 25, gantt: 'P1 P2 P4 P3 P5' },
    T4: { policy: 'FCFS', rule: 'R4', avgWT: 6, avgTAT: 12, avgRT: 6, switches: 3, finish: 24, gantt: 'P1 P2 P3 P4' },
    T5: { policy: 'FCFS', rule: 'R3', avgWT: 8, avgTAT: 12.5, avgRT: 8, switches: 3, finish: 18, gantt: 'P1 P2 P3 P4' },
    T6: { policy: 'FCFS', rule: 'R4', avgWT: 0, avgTAT: 3, avgRT: 0, switches: 0, finish: 19, gantt: 'P1 IDLE P2 IDLE P3' },
    T7: { policy: 'FCFS', rule: 'R1', avgWT: 0, avgTAT: 8, avgRT: 0, switches: 0, finish: 8, gantt: 'P1' },
    T8: { policy: 'RR', rule: 'R4', avgWT: 10.25, avgTAT: 14.75, avgRT: 1, switches: 17, finish: 18, gantt: 'P1 P2 P3 P1 P4 P2 P3 P1 P4 P2 P3 P1 P4 P2 P3 P1 P3 P1' },
    T9: { policy: 'Priority', rule: 'R2', avgWT: 3.7272727273, avgTAT: 8.4545454545, avgRT: 3.7272727273, switches: 10, finish: 52, gantt: 'P1 P2 P3 P4 P5 P6 P7 P11 P8 P9 P10' }
  };
  const exampleScores = {
    waiting: [79.6,91.7,91.7,30.0], response: [38.3,50.4,50.4,70.0],
    balanced: [70.7,79.3,79.3,50.0], throughput: [88.3,91.7,91.7,70.0]
  };
  const close = (actual, target, name, failures) => { if (Math.abs(actual - target) > 0.051) failures.push(`${name}: expected ${target}, got ${actual}`); };
  function runTests() {
    const failures = [], results = [];
    const example = S.getPreset('example'), profile = S.analyze(example);
    close(profile.meanBurst, 6.5, 'Worked example mean burst', failures); close(profile.cv, .317, 'Worked example CV', failures); close(profile.interactiveRatio, .5, 'Worked example interactive ratio', failures); close(profile.shortJobRatio, .5, 'Worked example short-job ratio', failures); close(profile.prioritySpread, 3, 'Worked example priority spread', failures); close(profile.arrivalSpread, 3, 'Worked example arrival spread', failures); close(profile.quantum, 3, 'Worked example adaptive q', failures);
    const selectedPolicies = ['FCFS','SJF','Priority','RR'];
    const all = selectedPolicies.map(policy => S.measure(S.run(policy, example, { quantum: 3 }), example));
    const expectations = { FCFS:[8.75,15.25,8.75,3], SJF:[7.75,14.25,7.75,3], Priority:[7.75,14.25,7.75,3], RR:[13.5,20,3,9] };
    all.forEach(r => { const e=expectations[r.policy]; close(r.avgWT,e[0],`${r.policy} avg WT`,failures); close(r.avgTAT,e[1],`${r.policy} avg TAT`,failures); close(r.avgRT,e[2],`${r.policy} avg RT`,failures); close(r.contextSwitches,e[3],`${r.policy} context switches`,failures); close(r.utilization,100,`${r.policy} utilization`,failures); close(r.throughput,4/26,`${r.policy} throughput`,failures); close(r.totalTime,26,`${r.policy} completion`,failures); });
    close(all[3].segments.map(s=>s.pid).join(' '), 'P1 P2 P3 P4 P1 P2 P3 P4 P1 P3', 'RR dispatch order', failures);
    Object.entries(exampleScores).forEach(([objective, values]) => { const board=S.score(all,objective); board.results.forEach((r,i)=>close(r.score,values[i],`${objective} score ${r.policy}`,failures)); });
    for (const objective of ['waiting','balanced','throughput']) if (S.select(profile,objective,false).rule !== 'R3') failures.push(`${objective}: expected R3`);
    if (S.select(profile,'response',false).rule !== 'R1') failures.push('Fast response objective should select R1.');
    for (const [id,e] of Object.entries(expected)) {
      const preset=S.presets.find(p=>p.id===id), respect=id==='T3'||id==='T9', aging=id==='T9';
      const evaluation=S.evaluate(preset.processes,{objective:'waiting',respectPriority:respect,aging,quantum:preset.quantum});
      const rule=S.select(evaluation.profile,'waiting',respect);
      const schedule=S.measure(S.run(e.policy,preset.processes,{quantum:preset.quantum??evaluation.profile.quantum,aging}),preset.processes);
      close(schedule.avgWT,e.avgWT,`${id} avg WT`,failures); close(schedule.avgTAT,e.avgTAT,`${id} avg TAT`,failures); close(schedule.avgRT,e.avgRT,`${id} avg RT`,failures); close(schedule.contextSwitches,e.switches,`${id} context switches`,failures); close(schedule.totalTime,e.finish,`${id} finish`,failures);
      if (schedule.segments.map(s=>s.pid).join(' ')!==e.gantt) failures.push(`${id} Gantt: expected ${e.gantt}, got ${schedule.segments.map(s=>s.pid).join(' ')}`);
      if (rule.rule!==e.rule) failures.push(`${id} decision rule: expected ${e.rule}, got ${rule.rule}`);
      if (id==='T9') { const plain=S.measure(S.run('Priority',preset.processes,{aging:false}),preset.processes); if (!(schedule.processes.find(p=>p.id==='P11').WT < plain.processes.find(p=>p.id==='P11').WT)) failures.push('Aging must lower T9 P11 waiting time.'); }
      results.push({ id, passed: !failures.some(f=>f.startsWith(`${id} `) || (id==='T9' && f.startsWith('Aging'))), expected:e });
    }
    const validation=S.validateProcesses([{id:'P1',arrival:0,burst:1,priority:1,type:'cpu'},{id:'p1',arrival:-1,burst:0,priority:0,type:'nope'}]);
    if (validation.valid || !validation.errors.length) failures.push('Validator must reject duplicate IDs and invalid fields.');
    results.unshift({id:'Worked example',passed:failures.length===0});
    return { passed: failures.length===0, count: 10, results, failures };
  }
  const api={expected,exampleScores,runTests};
  S.tests=api;
  if (typeof module!=='undefined'&&module.exports) { module.exports=api; if(require.main===module){const r=runTests();console.log(`${r.passed?'PASS':'FAIL'} ${r.count} SCHEDULAB checks`);if(r.failures.length){console.error(r.failures.join('\n'));process.exitCode=1;}} }
})(typeof globalThis!=='undefined'?globalThis:this);
