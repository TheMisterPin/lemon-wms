# Redundant or Duplicated Files Audit

This document identifies likely redundancy/duplication based on file names, locations, and naming patterns.

## 1) Confirmed/High-Confidence Duplicates

### Duplicate component by casing
- `src/components/inputs/TextInput.tsx` -> `src/components/inputs/text-input.tsx`
  - Reason: same folder + same semantic name with only case difference.
  - Recommendation: keep one file and normalize to kebab-case.

## 2) Likely Redundant Overlaps (Needs Functional Confirmation)

### Loader components overlap
- `src/components/universal-loader.tsx` -> `src/components/shared/Loader.tsx`
  - Reason: two generic loader components with overlapping intent.

### Generic form overlap
- `src/components/dynamic-form.tsx` -> `src/components/inputs/dynamic-form-field.tsx`
  - Reason: both appear to represent dynamic form rendering primitives.

### Legacy `utils/components/forms/schemas` vs `lib/components/configs`
- `src/utils/components/forms/schemas/create-user-form.ts` -> `src/lib/components/configs/entities/user/schema.ts`
- `src/utils/components/forms/schemas/login-form.ts` -> `src/lib/components/configs/entities/device/schema.ts` (or an auth-focused schema file)
  - Reason: schema/config responsibility appears split across two different roots.

## 3) Naming Issues / Rename Candidates

### Misnamed device entity updater
- `src/lib/entities/devices/update-bin.ts` -> `src/lib/entities/devices/update-device.ts`
  - Reason: file is under `devices` entity folder but file name references `bin`.

### Folder-level naming consistency (optional)
- `src/components/shared/Loader.tsx` -> `src/components/shared/loader.tsx`
- `src/components/dashboard/StatusBadge.tsx` -> `src/components/dashboard/status-badge.tsx`
- `src/components/dashboard/MetricCard.tsx` -> `src/components/dashboard/metric-card.tsx`
  - Reason: mixed PascalCase and kebab-case conventions in same tree.

## 4) Duplicate `middleware` test naming collision

- `src/__tests__/middleware.test.ts` -> `src/__tests__/app-middleware.test.ts`
- `src/__tests__/lib/auth/middleware.test.ts` -> `src/__tests__/lib/auth/auth-middleware.test.ts`
  - Reason: two tests with the same filename at different scopes can be confusing in CI output.

## 5) Suggested Cleanup Order

1. Remove casing duplicates first (`TextInput.tsx` vs `text-input.tsx`).
2. Resolve misnamed entity files (`update-bin.ts` in `devices`).
3. Consolidate shared utility/schema locations.
4. Normalize naming style (kebab-case or PascalCase by convention).
5. Rename ambiguous tests for clearer diagnostics.
