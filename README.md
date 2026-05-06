# pi-autoresearch

Karpathy-style autonomous research loops for pi.

This is not a clone of `karpathy/autoresearch`'s training code. It is the missing harness around that idea: propose one experiment, run the benchmark, parse the metric, keep the patch only if it improves, otherwise revert and continue.

Default target is the upstream shape:

- `program.md` — research-org instructions for the agent
- `train.py` — file the agent is allowed to edit
- `uv run train.py` — evaluation command
- `val_bpb` — metric, lower is better

## Install

```bash
bun install
bun run build
bun link
```

Or use directly:

```bash
bun run src/cli.ts -- init
bun run src/cli.ts -- run
```

## Use in an autoresearch repo

```bash
pi-autoresearch init
# edit autoresearch.config.json if needed
pi-autoresearch run
pi-autoresearch status
```

## Config

```json
{
  "targetFiles": ["train.py"],
  "programFile": "program.md",
  "metric": {
    "name": "val_bpb",
    "direction": "min",
    "regex": "val_bpb:\\s*([0-9]+(?:\\.[0-9]+)?)"
  },
  "commands": {
    "setup": "uv run prepare.py",
    "evaluate": "uv run train.py",
    "propose": "pi -p --no-session --no-extensions \"Read program.md. Propose and implement exactly one research experiment by editing only the configured target files. Keep the evaluation command runnable. Do not run the evaluation. Summarize the hypothesis in .pi-autoresearch/hypothesis.md.\""
  },
  "limits": {
    "iterations": 12,
    "commandTimeoutSeconds": 900
  }
}
```

## Loop semantics

For each iteration:

1. Capture current git commit.
2. Run the proposal command.
3. Require changes to configured target files.
4. Save patch under `.pi-autoresearch/patches/`.
5. Run evaluation command with timeout.
6. Parse configured metric from stdout/stderr.
7. Accept if metric improves according to `direction`; commit accepted patch.
8. Reject/fail by checking out target files.
9. Append JSON state under `.pi-autoresearch/state.json`.

This keeps the agent honest. The metric earns the patch. Everything else is theatre.

## Upstream inspiration

- https://github.com/karpathy/autoresearch
