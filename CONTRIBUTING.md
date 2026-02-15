# CONTRIBUTING TO XENO_PROTOCOL

All contributions to this repository must conform to the standards defined below. Non-compliant submissions will be rejected without review.

---

## I. PREREQUISITES

Before submitting any contribution:

1. Read the `README.md` in its entirety. Understand the Systemic Topology, Cognitive Execution Plane, and Persistence Layer architecture.
2. Ensure your local environment meets the specifications in Section VI of the README (Node.js v20.11.0+, TypeScript 5.6.x strict mode, Next.js 14.2.x).
3. Verify that `npx tsc --noEmit` passes with zero errors before committing.

---

## II. LANGUAGE ENFORCEMENT

**English only.** This rule is absolute and non-negotiable.

- All source code, comments, string literals, variable names, function names, commit messages, PR descriptions, and documentation must be written in idiomatic English.
- No non-ASCII characters in source files except where technically required (e.g., Unicode escape sequences in test data).
- Violations will result in immediate PR rejection.

---

## III. BRANCH & COMMIT DISCIPLINE

### Branch Model

- `main` -- Protected. Represents the latest stable state.
- Feature branches -- Named `feature/<short-description>` (e.g., `feature/redis-cache-layer`).
- Fix branches -- Named `fix/<short-description>` (e.g., `fix/memory-store-overflow`).

### Commit Format

All commit messages must follow this specification:

```
<Type>-<Short-description>
```

- **Type:** One of `Add`, `Fix`, `Update`, `Remove`, `Refactor`, `Docs`.
- **Description:** Imperative mood, hyphen-delimited, ASCII only.
- **Examples:**
  - `Add-redis-cache-integration`
  - `Fix-memory-fragment-overflow`
  - `Refactor-personality-prompt-compilation`
  - `Docs-update-endpoint-specification`

Commits with vague messages (`fix stuff`, `update`, `wip`) will be rejected.

---

## IV. PULL REQUEST REQUIREMENTS

### Before Opening a PR

1. **Compile check:** `npx tsc --noEmit` must exit 0.
2. **Lint check:** If ESLint is configured, `npm run lint` must exit 0.
3. **Self-review:** Read your own diff line by line. Remove debug logs, commented-out code, and TODO placeholders.
4. **Single responsibility:** Each PR addresses one concern. Do not bundle unrelated changes.

### PR Description Template

Every PR must include the following sections:

```
## Summary
[1-3 sentences describing what this PR does and why.]

## Changes
- [File path]: [What changed and why]
- [File path]: [What changed and why]

## Testing
[How was this tested? Steps to reproduce or verify.]

## Compliance Checklist
- [ ] English only (code, comments, strings, docs)
- [ ] `npx tsc --noEmit` passes
- [ ] No new `any` types introduced
- [ ] No console.log left in committed code (console.error/warn for error paths only)
- [ ] Commit messages follow the specification
```

### Review Process

- All PRs require at least one approval before merge.
- Squash merge is the default merge strategy.
- Force-pushes to `main` are prohibited.

---

## V. CODE STANDARDS

### TypeScript

- Strict mode enforced (`"strict": true` in `tsconfig.json`).
- No `any` types in committed code. Use `unknown` with type guards.
- Prefer `interface` over `type` for object shapes.
- All exported functions must have JSDoc comments describing purpose, parameters, and return value.

### File Organization

- One exported component/function per file (barrel exports in `index.ts` are acceptable).
- Import order: Node builtins > External packages > Internal modules > Relative imports. Separate groups with a blank line.

### XENO Personality Compliance

Any modification to files in `core/personality/` must preserve the Cold Observer Standard:

- Zero emotional validation in prompt output.
- No assistant-pattern language ("I'm here to help", "Let me know", "Sure!").
- Deterministic tone: cold, precise, elite.
- Modifications to system prompts require explicit justification in the PR description.

---

## VI. REPORTING ISSUES

- Use GitHub Issues for bug reports and feature requests.
- Bug reports must include: steps to reproduce, expected behavior, actual behavior, environment details (OS, Node version, browser if applicable).
- Feature requests must include: motivation, proposed implementation approach, and impact on existing architecture.

---

This document is effective as of Revision 0.1.5-Alpha. Non-compliance is not tolerated.