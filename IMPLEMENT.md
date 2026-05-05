# IMPLEMENT.md

## Purpose

This guide defines practical best practices for using and developing khmerskills.

khmerskills is a universal skills loader for AI coding agents. It installs skills from GitHub repositories, tracks installed metadata, and synchronizes discoverable skill definitions into AGENTS.md.

## Best Practices for Users

### 1. Install and run the CLI correctly

- For local development builds, use `npm link` from the khmerskills repository root.
- For published builds, use `npm install -g khmerskills`.
- Verify setup with `khmerskills --help` and `khmerskills --version`.

### 2. Use the core command flow consistently

1. Install a skill repo: `khmerskills install owner/repo`
2. Confirm installation: `khmerskills list`
3. Sync AGENTS metadata into current project: `khmerskills sync`
4. Load one skill instructions: `khmerskills read <skill-name>`

### 3. Keep AGENTS.md stable

- Do not remove these markers:
  - `<!-- OPEN_SKILLS_START -->`
  - `<!-- OPEN_SKILLS_END -->`
- These markers are required for safe updates by `khmerskills sync`.

### 4. Prefer verbose checks when debugging metadata

- Use `khmerskills list --verbose` to inspect:
  - version
  - author
  - tags
  - installed path

### 5. Keep a valid metadata file in skill repos

- Include a `skills.json` file in each skill repository.
- Validate it against `skills.schema.json` to avoid inconsistent metadata.
- Recommended fields:
  - `name`
  - `description`
  - `version`
  - `author`
  - `tags`

### 6. Re-sync after install/remove operations

- `install` and `remove` already trigger sync in current CLI behavior.
- If AGENTS.md is changed manually, run `khmerskills sync` again.

## Best Practices for Developers

### 1. Maintain strict TypeScript compatibility

- Keep code strict-mode safe.
- Use clear interfaces and avoid untyped data flows where possible.
- Build after every change: `npm run build`.

### 2. Avoid duplicated logic

- Keep repository parsing and clone/update behavior in utility modules.
- Keep AGENTS.md generation/upsert behavior in utility modules.
- Command handlers should orchestrate, not duplicate implementation details.

### 3. Keep command UX stable

- Preserve existing command names and flags unless change is intentional.
- Keep success and error messages actionable.
- Include guidance messages for recovery steps.

### 4. Treat metadata and docs as part of product quality

- Keep `README.md`, `AGENTS.md`, `SKILL.md`, and `INSTRUCTIONS.md` aligned with real behavior.
- Keep command examples executable and current.
- Keep `skills.json` values accurate for the repository.

### 5. Validate changes before commit

- Minimum checks:
  - `npm run build`
  - basic command smoke tests (`list`, `sync`, `read`)
- If changing install/sync flows, run end-to-end checks.

### 6. Commit hygiene

- Make small, focused commits.
- Stage only intended files.
- Avoid bundling unrelated generated or local changes.

### 7. Cross-platform compatibility

- Prefer path-safe Node APIs over platform-specific assumptions.
- Keep terminal command examples simple and portable.

### 8. Error handling standards

- Fail fast with clear messages.
- Return non-zero exit codes on command failure.
- Surface enough context for user troubleshooting.

## Recommended Workflow

1. Pull latest changes.
2. Implement one focused change.
3. Run `npm run build`.
4. Run CLI smoke tests.
5. Update docs if behavior changed.
6. Commit and push.

## Troubleshooting Quick Notes

- `khmerskills` command not found:
  - Use `npm link` for local builds.
  - Confirm shell session picks up npm global bin path.
- `node dist/index.js` not found:
  - Run from repository root, or use global linked command (`khmerskills ...`).
- AGENTS.md not updating as expected:
  - Confirm markers exist and are not altered.
  - Re-run `khmerskills sync`.
