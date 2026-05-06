# Extension development notes

This repo should take its extension craft cues from Nico Bailon's pi packages, especially `pi-interactive-shell`, `pi-subagents`, `pi-web-access`, `pi-annotate`, and `pi-review-loop`.

## What Nico does well

### 1. Productized package, not loose script

Nico's strongest repos ship as complete pi packages:

- `package.json` has `pi.extensions`, `pi.skills`, `repository`, `bugs`, `homepage`, useful keywords, and a short product description.
- The package includes a README, CHANGELOG, skill directory, and often a banner/video.
- The public repo explains what the user asks in chat versus what the agent calls as tools.

For `pi-autoresearch`: treat the CLI as the engine, but the pi package as the product surface.

### 2. Modes are explicit

`pi-interactive-shell` is popular because the modes are legible:

- interactive
- hands-free
- dispatch
- monitor

Each mode has different control flow, user visibility, and completion semantics. The docs name those tradeoffs directly.

For `pi-autoresearch`, the equivalent modes should be:

- `init` — create config/program scaffold.
- `run` — synchronous metric-gated loop.
- `status` — inspect state and best metric.
- `stop` — future process-level cancellation if/when background runs exist.
- `monitor` — future event-driven watcher when research loops run out-of-band.

Do not hide these modes behind vague prose.

### 3. Operational caveats are documented, not buried

Nico documents the unglamorous bits:

- install command
- runtime requirements
- shortcuts
- config file paths
- failure cases
- what to do when a session finishes
- how to inspect/recover state

For `pi-autoresearch`, document:

- git repo required
- clean-ish working tree recommended
- target files are the only files reverted on rejection
- setup/eval/propose timeout behavior
- metric regex must match stdout/stderr
- accepted experiments are committed
- rejected experiments leave patch/log artifacts

### 4. Safety boundaries are real interfaces

`pi-subagents` has concrete artifacts, max-depth, output modes, worktree conflict handling, async status, and fallback attempts. It doesn't rely on "the model should behave" as the boundary.

For `pi-autoresearch`, the safety interface is:

- configured `targetFiles`
- git diff / checkout of target files
- metric parser
- accepted commit
- state JSON
- patch/log artifacts

If an experiment cannot be scored, reject it. If it does not touch target files, reject it. If it improves, commit it. No vibes.

### 5. Source is modular by responsibility

The popular repos split responsibility cleanly:

- extension entry and tool registration
- schema/config
- runtime/session manager
- rendering/notification utils
- provider adapters
- tests around awkward lifecycle cases

For `pi-autoresearch`, keep this split:

- `src/run.ts` — loop orchestration
- `src/config.ts` — config defaults/validation
- `src/metric.ts` — metric extraction/improvement
- `src/git.ts` — safety boundary
- `src/extension/index.ts` — thin pi wrapper only

The extension wrapper should stay boring.

### 6. Tests follow lifecycle risk, not only happy path

Nico's hotspot pattern shows tests around lifecycle edges: session queries, dispatch recovery, headless monitor, overlay shortcuts, integration portability, provider fallback, stale notices.

For `pi-autoresearch`, add tests for:

- rejection when metric regresses
- rejection when metric is absent
- rejection when no target files changed
- setup/evaluation failure
- timeout behavior
- state preservation across multiple accepted/rejected iterations

### 7. CHANGELOG is part of the interface

Nico's most changed files are consistently `CHANGELOG.md`, `README.md`, `package.json`, and the extension entry. That is the pattern: every operational behavior change gets documented.

For `pi-autoresearch`, add `CHANGELOG.md` before tagging or publishing.

## Immediate bar for this repo

Before calling it good:

- `package.json` should expose the pi extension from source (`./src/extension/index.ts`) for direct pi loading.
- `files` should include `src`, `README.md`, `PRIOR_ART.md`, `EXTENSION_DEV.md`, and future `skills/`.
- Add a bundled skill before npm publishing.
- Add `repository`, `bugs`, `homepage`, and `author` metadata.
- Keep the CLI build path for ordinary shell users.

Small tool, full product surface. That's the Nico lesson.
