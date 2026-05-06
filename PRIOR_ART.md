# Prior art

`pi-autoresearch` sits in the Karpathy-loop family: edit one bounded target, run an objective evaluation, keep improvements, revert regressions, repeat with an audit trail.

## Direct inspiration

- `karpathy/autoresearch` — minimal ML training sandbox: `program.md`, mutable `train.py`, fixed time budget, `val_bpb` metric. It deliberately has no orchestration script; the coding agent is expected to run the loop itself.

## Closest existing implementations

- `davebcn87/pi-autoresearch` — pi extension with slash commands, hooks, JSONL state, ASI annotations, and active pi-mode workflow. This is the closest name collision and probably the richer interactive extension surface.
- `proyecto26/autoresearch-ai-plugin` — Claude Code plugin with generic metric loops, ASI, secondary metrics, confidence scoring, and ML templates.
- `199-biotechnologies/autoresearch-cli` — CLI with `program.md`, `autoresearch.toml`, eval command, metric recording, and experiments JSONL.
- `uditgoenka/autoresearch` — Claude skill emphasizing eight rules: read before write, one change per iteration, mechanical verification, automatic rollback, git as memory.
- `wjgoarxiv/autoresearch-skill` — natural-language `research.md` skill for Claude/Codex/Gemini style loops with logging and rollback.
- NousResearch/Hermes Agent issues #4823/#4832 — proposed git branch → experiment → evaluate → merge/revert skill with both ML metric mode and knowledge-rubric mode.

## Adjacent autonomous research systems

- Sakana AI `AI-Scientist` — end-to-end idea → experiment → paper → review workflow. Much broader than metric-harness loops.
- Agent Laboratory / AgentRxiv — multi-agent literature review, experimentation, report writing, cumulative research memory.
- Kosmos-style AI scientist implementations — multi-agent scientific workflows with sandboxed execution, literature tools, validation, and knowledge graphs.

## Positioning for `joelhooks/pi-autoresearch`

This repo should not pretend to be the first pi-autoresearch. It is intentionally a small, inspectable TypeScript harness:

- Library + CLI first, not a pi shortcut UX first.
- Generic target/evaluate/metric config, defaulting to Karpathy's `val_bpb` shape.
- Objective metric gate only in v1; subjective knowledge-rubric mode can come later.
- Git state remains the safety boundary: accepted patches are committed, rejected patches are checked out.
- `.pi-autoresearch/state.json` and patch/log artifacts are durable enough for external monitors or future pi tools.

The useful next step is a pi extension wrapper around this core, with tools like `autoresearch_init`, `autoresearch_run`, `autoresearch_status`, and `autoresearch_stop` rather than baking all behavior into prompts.
