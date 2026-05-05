# INSTRUCTIONS.md

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Build the project:

```bash
npm run build
```

3. Link CLI globally for local testing:

```bash
npm link
```

4. Verify the CLI is available:

```bash
khmerskills --help
```

## Development Workflow

1. Make focused changes.
2. Build and re-link:

```bash
npm run build
npm link
```

3. Test primary flows:

```bash
khmerskills list
khmerskills sync
```

## Documentation Rules

- Keep README command examples accurate.
- Keep AGENTS.md markers intact:
  - `<!-- OPEN_SKILLS_START -->`
  - `<!-- OPEN_SKILLS_END -->`
- Keep SKILL.md and INSTRUCTIONS.md up to date with current behavior.

## Release Checklist

- Build succeeds.
- README examples match actual command names.
- License and repository metadata are present.
