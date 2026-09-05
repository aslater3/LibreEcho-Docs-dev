# LibreEcho-Docs-dev — Agent instructions

This repository is the LibreEcho development website and browser-local Control
Centre demo, published from `dev`. Keep changes limited to this site, demo,
artwork, notices, and its Pages workflow. Read `README.md` before non-trivial
work.

## Operating contract

- Complete the user's requested outcome within its intended scope. A fix or
  implementation request authorizes reversible local preparation, an isolated
  purpose-named branch/worktree, necessary in-scope edits, local commits, and appropriate
  validation. A review, diagnosis, explanation, or plan does not authorize
  project edits.
- Ask only for a material decision, genuine scope expansion, or a separately
  gated action. Preserve separate authorization for pushing, pull requests,
  merging, publication, releases, and hardware changes.
- Subject to higher-priority system/developer instructions and these project
  safety boundaries, the user's current request takes precedence over
  procedural skill defaults. If an instruction blocks the requested outcome,
  identify its file, quote the exact blocking text, explain the conflict, and
  finish independent authorized work instead of silently abandoning it.
- Delegate independent bounded research, review, or test analysis only when it
  improves the result. Give each worker disjoint write ownership and verify its
  findings before reporting success.
- Use concise plain language. Report the result, exact evidence, and remaining
  blockers; distinguish local commits, remote publication, CI, and deployment.

## Repository workflow

- `dev` is the development site's published branch. Start work from the fetched
  current `dev` in a purpose-named branch such as `docs/<purpose>`; do not commit
  directly to `dev` or assume that a local branch is current.
- Before editing, verify repository root, branch, `HEAD`, upstream/default-branch
  relation, worktree registration, and porcelain status. Preserve unrelated
  changes; do not reset, stash, clean, or repurpose another worktree.
- Keep edits within the requested outcome. Necessary cross-repository changes
  belong in separate owning-repository branches; do not perform unrelated
  changes or edit generated output, private evidence or deployed worktrees.
- Never publish device identifiers, serials, MAC addresses, private addresses,
  private manifests, credentials, tokens, or local absolute paths. Keep demo
  behavior browser-local: its settings use `localStorage`, and passwords,
  tokens, and uploaded configuration files must not be sent off-device. Keep
  status claims consistent with `README.md` and label unverified hardware
  behavior as unverified.

## Validation

Run the smallest meaningful checks that establish all requested acceptance
criteria, plus all applicable required checks. Broaden or repeat testing only
when changes, failures or unresolved risks justify it. Do not add tests that
merely mirror reversible low-impact implementation details. Bounded background
checks and temporary local test servers are permitted when needed for authorized
validation; stop temporary processes afterward. Report unrelated failures
without fixing them silently or treating incomplete evidence as success.

No repository-local test runner is declared in this repository's README or
Pages workflow; do not invent one. For all edits run the applicable lightweight
check:

```bash
git diff --check
```

Use the documented local preview when needed:

```bash
python3 -m http.server 8000
```

The Pages workflow checks out `aslater3/LibreEcho-UI`, runs its `make -C
ui-source -j2`, starts the mock native demo, and uses Playwright to render the
current captures. Those external build, browser, CI, and deployment steps are
not proven by a local static edit; report them separately if they are actually
run. When a PR/push workflow is authorized, complete its required CI checks without
asking again for each read-only check. Use bounded waits; report pending checks
at the deadline rather than waiting indefinitely.

## Completion and publication gates

Record the exact commit and commands/results. A local commit is not a push,
pull request, merge, Pages publication, release, or hardware validation. Those
actions require explicit authorization and their applicable branch, review, CI,
and release gates. Do not expand the requested outcome or silently alter the production site.
