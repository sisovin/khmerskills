# SKILL.md

## Name

khmetskills-core

## Description

Core operational skill for developing and maintaining the khmetskills CLI project.

## Use When

- Implementing or refactoring CLI commands.
- Updating skill sync behavior and AGENTS.md generation.
- Improving repository install/update/remove flows.
- Fixing TypeScript build or typing issues.

## Expectations

- Keep command UX simple and predictable.
- Reuse utility modules instead of duplicating logic.
- Validate with `npm run build` after code edits.
- Keep documentation aligned with command behavior.

## Key Files

- `src/index.ts`
- `src/commands/*.ts`
- `src/utils/git.ts`
- `src/utils/skills.ts`
- `src/utils/agents-md.ts`
