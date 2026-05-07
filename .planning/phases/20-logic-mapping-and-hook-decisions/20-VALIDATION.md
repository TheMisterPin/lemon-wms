---
phase: 20-logic-mapping-and-hook-decisions
slug: logic-mapping-and-hook-decisions
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-05-07
---

# Phase 20 — Validation Strategy

> Documentation-only phase: validation is grep/read gates plus **no `src/**` changes** and **no new target folders under `src/`**.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest (baseline unchanged — Phase 20 adds no tests) |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `rg '^## Logic Mapping' .docs/developer/refactors` |
| **Full suite command** | `pnpm test` (optional sanity — Phase 20 docs-only default skips unless executor chooses) |
| **Estimated runtime** | \<10 seconds for grep gates |

---

## Sampling Rate

- **After every task:** `git diff --name-only -- 'src/**'` empty; `git status --porcelain -- src` empty.
- **After every wave:** Spot-check movement tables use CFR-10 target kinds (`hook`, `transformer`, `types/api`, `types/dto`, `utility`, retained render).
- **Phase gate:** Non-zero `## Logic Mapping` matches under `.docs/developer/refactors`; canonical warehouse hook doc has implementation-ready split narrative.

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 20-01-xx | 01 | 1 | CFR-09 | T-20-01 | Logic taxonomy scaffold present | docs | `rg 'Logic Mapping|Phase 20' .docs/developer/refactors` | ✅ | ⬜ pending |
| 20-02-xx | 02 | 2 | CFR-09, CFR-10, CFR-13 | T-20-02 | Warehouse split documented; shared mutation-error path documented | docs | `rg 'Logic Mapping|extractMutationError|actions:'` targeted paths | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers Phase 20 — **no new test files**. Logic Mapping sections are the verification artifact.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|---------------------|
| Movement reason/risk quality | CFR-10 | Judgment | Review 3 split-row docs for coherent Target location + Reason + Risk. |

---

## Validation Sign-Off

- [ ] All tasks document grep-able `<automated>` or equivalent verify blocks.
- [ ] Every wave verifies empty `git diff --name-only -- 'src/**'` and empty `git status --porcelain -- src`.
- [ ] Target-folder creep check: no new `src/components/features/**`, `src/hooks/**` trees created in Phase 20 execution (unless repo already had path — document baseline).
- [ ] CFR-09–CFR-13 each mapped to at least one plan `requirements` list.
- [ ] `nyquist_compliant: true` set after execution evidence recorded.

**Approval:** pending
