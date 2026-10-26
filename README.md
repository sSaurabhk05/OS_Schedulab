# SCHEDULAB · CPU Scheduling Studio

A self-contained, offline CPU scheduling simulator and explainable policy comparison studio. It runs directly from `index.html`; no package install, build step, network connection, or backend is required.

## Run

Open `index.html` in a modern browser. Select **Get started**, enter the number of processes (1–20), fill the blank process forms, choose an objective, then select **Run analysis**. No workload data is prefilled or restored when the page opens. The intro can be skipped. The theme preference is saved locally.

To host the static site on GitHub Pages, publish the repository root; `index.html` is the entry page. No build step is needed.

To run the reference checks with Node.js:

```sh
node tests/test-cases.js
```

## Included

- FCFS, non-preemptive SJF, non-preemptive priority, and Round Robin schedules
- Adaptive or manual Round Robin quantum and optional priority aging
- Workload validation, presets T1–T9, import/export, seeded variation scenarios
- Workload profile, explainable R1–R4 decision trace, normalized objective score, regret, charts, Gantt schedule and playback
- Keyboard command palette, keyboard shortcuts, responsive layout, reduced-motion support, dark/light theme
- Ten deterministic reference checks, including all nine supplied test workloads

## Project map

- `index.html`: semantic app shell and inline icon sprite
- `css/`: studio, Gantt, and landing page styles
- `js/`: configuration, validation, workload analysis, policies, metrics, scorecard, decision engine, presets, UI, and app behavior
- `tests/test-cases.js`: browser and Node.js verification suite
- `output/pdf/SCHEDULAB_Project_QA_Guide.pdf`: project Q&A and presentation guide

## Model assumptions

Single CPU; known CPU burst durations; zero timed context-switch overhead; user-declared process class; integer time units; lower numeric priority means higher priority. This is an educational simulator, not a live kernel scheduler.
