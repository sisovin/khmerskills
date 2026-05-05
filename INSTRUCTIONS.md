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

3. Run CLI from compiled output:

```bash
npm run start -- --help
```

## Development Workflow

1. Make focused changes.
2. Build and verify:

```bash
npm run build
```

3. Test primary flows:

```bash
node dist/index.js list
node dist/index.js sync
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
