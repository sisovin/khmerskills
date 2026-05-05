# ENGINEERED PROMPT

```md
Build me a TypeScript command line tool called khmerskills that lets people use Claude style AI agent skills with other coding agents like Cursor, Copilot, or anything that can read project files.

It should install globally with npm and expose commands to install skills from a GitHub repo, list installed skills, read a skill by name, sync the current project, and remove one or all skills. Installed skills should be tracked in a config file. When someone runs sync, update or create an AGENTS.md file in the project that contains an XML style list of available skills with the name, description, local path, repository, and version.

A skill repo should work if it has SKILL.md, README.md, or INSTRUCTIONS.md, and optionally a skills.json metadata file. Make the CLI pleasant to use, with clear errors and helpful output. Include build scripts, TypeScript setup, and enough README instructions so someone can install, test locally, and publish it.
```