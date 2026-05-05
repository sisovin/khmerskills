# ENGINEERED PROMPT

```md
I want to build a command-line tool in TypeScript called `khmetskills`. The main idea is to create a universal skills loader for AI coding agents. It should take the concept of skills from Anthropic's Claude and make it work with any agent, like GitHub Copilot, or anything that can read a file.

A user should be able to run `npx openskills install some-org/some-skills` to download skills from a GitHub repo (https://github.com/numman-ali/openskills.git ). The tool will then update a special `AGENTS.md` file in the project, listing all the available skills in an XML format so the AI can see them.

The agent would then use a command like `npx khmerskills read <skill-name>` to load the specific instructions for a task. It should also have other basic commands like `list`, `sync`, and `remove` to manage the installed skills. Think of it as a universal package manager for AI agent skills.
```