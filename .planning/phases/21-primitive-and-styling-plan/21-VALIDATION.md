---
phase: 21-primitive-and-styling-plan
slug: primitive-and-styling-plan
status: complete
nyquist_compliant: true
wave_0_complete: true
created: 2026-05-07
---

# Phase 21 — Validation Strategy

Documentation-only phase — verification is grep + empty `src/**` diff **until Phase 22 implements extractions**.

## Test infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest (unchanged; Phase 21 adds no tests) |
| **Quick run command** | `grep -R '^## Primitive Candidate' .docs/developer/refactors --include='*.md' \| wc -l` OR `grep -q '_primitive-extraction-plan.md'` |
| **Full suite command** | `pnpm test` (optional sanity after Phase 22 — not Phase 21 gate) |

## Sampling rate

- After each task: `git diff --name-only -- 'src/**'` empty.
- After waves: `_primitive-extraction-plan.md` lists every approve/defer/reject with evidence pointer.

## Wave 0

No new automated tests — docs are the artifact.

## Manual verification

- Spot-check 3 primitive candidate docs include CFR-14 fields (purpose, sources, target path, props sketch, allowed/forbidden).

## Sign-off

- [x] CFR-14–CFR-17 addressed across plans’ `requirements:` coverage
- [x] `git diff --name-only -- 'src/**'` empty for Phase 21 execution
- [x] `nyquist_compliant: true` after execution evidence

**Approval:** phase execution complete (documentation-only)
