# ENGINEERING DESIGN

This project is to build `khmerskills` - a universal skills loader for AI coding agents. This is a great concept that bridges the gap between Claude's skills system and other AI agents.

## Project Structure

```
khmerskills/
├── src/
│   ├── index.ts          # CLI entry point
│   ├── commands/
│   │   ├── install.ts    # Install skills from GitHub
│   │   ├── read.ts       # Read a specific skill
│   │   ├── list.ts       # List installed skills
│   │   ├── sync.ts       # Sync skills with AGENTS.md
│   │   └── remove.ts     # Remove installed skills
│   ├── utils/
│   │   ├── git.ts        # Git clone/download utilities
│   │   ├── skills.ts     # Skills management logic
│   │   └── agents-md.ts  # AGENTS.md generation/updates
│   └── types.ts          # TypeScript interfaces
├── package.json
├── tsconfig.json
└── README.md
```

## Implementation

### 1. Package Configuration

**package.json:**
```json
{
  "name": "khmerskills",
  "version": "1.0.0",
  "description": "Universal skills loader for AI coding agents",
  "main": "dist/index.js",
  "bin": {
    "khmerskills": "./dist/index.js",
    "openskills": "./dist/index.js"
  },
  "scripts": {
    "build": "tsc",
    "dev": "ts-node src/index.ts",
    "start": "node dist/index.js"
  },
  "keywords": ["ai", "skills", "claude", "copilot", "agent"],
  "author": "",
  "license": "MIT",
  "dependencies": {
    "commander": "^11.1.0",
    "simple-git": "^3.20.0",
    "fs-extra": "^11.2.0",
    "chalk": "^4.1.2",
    "ora": "^5.4.1",
    "yaml": "^2.3.4",
    "marked": "^11.1.0"
  },
  "devDependencies": {
    "@types/fs-extra": "^11.0.4",
    "@types/node": "^20.10.0",
    "typescript": "^5.3.2",
    "ts-node": "^10.9.1"
  }
}
```

### 2. TypeScript Configuration

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 3. Types Definition

**src/types.ts:**
```typescript
export interface SkillMetadata {
  name: string;
  description: string;
  version: string;
  author: string;
  tags: string[];
}

export interface InstalledSkill {
  metadata: SkillMetadata;
  installedPath: string;
  repository: string;
  installedAt: string;
}

export interface SkillsConfig {
  skills: InstalledSkill[];
  lastSync: string;
}

export interface GithubRepo {
  owner: string;
  repo: string;
  branch?: string;
}
```

### 4. Main CLI Entry Point

**src/index.ts:**
```typescript
#!/usr/bin/env node

import { Command } from 'commander';
import { installCommand } from './commands/install';
import { readCommand } from './commands/read';
import { listCommand } from './commands/list';
import { syncCommand } from './commands/sync';
import { removeCommand } from './commands/remove';

const program = new Command();

program
  .name('khmerskills')
  .description('Universal skills loader for AI coding agents')
  .version('1.0.0');

program
  .command('install <repository>')
  .description('Install skills from a GitHub repository')
  .option('-b, --branch <branch>', 'Specific branch to install from')
  .action(installCommand);

program
  .command('read <skill-name>')
  .description('Read and display a specific skill\'s instructions')
  .action(readCommand);

program
  .command('list')
  .description('List all installed skills')
  .option('-v, --verbose', 'Show detailed information')
  .action(listCommand);

program
  .command('sync')
  .description('Sync skills with the current project\'s AGENTS.md file')
  .action(syncCommand);

program
  .command('remove <skill-name>')
  .description('Remove an installed skill')
  .option('-a, --all', 'Remove all installed skills')
  .action(removeCommand);

program.parse(process.argv);
```

### 5. Install Command

**src/commands/install.ts:**
```typescript
import ora from 'ora';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs-extra';
import simpleGit from 'simple-git';
import { GithubRepo, InstalledSkill } from '../types';
import { getSkillsDir, getConfig, saveConfig } from '../utils/skills';

function parseGithubUrl(repository: string): GithubRepo {
  // Handle formats: owner/repo, https://github.com/owner/repo, git@github.com:owner/repo
  const cleanRepo = repository
    .replace(/^(https?:\/\/)?github\.com\//, '')
    .replace(/^git@github\.com:/, '')
    .replace(/\.git$/, '');
  
  const [owner, repo] = cleanRepo.split('/');
  
  if (!owner || !repo) {
    throw new Error('Invalid GitHub repository format. Use owner/repo format.');
  }
  
  return { owner, repo };
}

export async function installCommand(repository: string, options: { branch?: string }): Promise<void> {
  const spinner = ora('Installing skills...').start();
  
  try {
    const repo = parseGithubUrl(repository);
    const skillsDir = getSkillsDir();
    const installPath = path.join(skillsDir, repo.owner, repo.repo);
    
    // Ensure skills directory exists
    await fs.ensureDir(skillsDir);
    
    // Clone repository
    const git = simpleGit();
    const cloneUrl = `https://github.com/${repo.owner}/${repo.repo}.git`;
    
    spinner.text = `Cloning from ${repo.owner}/${repo.repo}...`;
    
    if (await fs.pathExists(installPath)) {
      // Update existing installation
      await git.cwd(installPath).pull();
    } else {
      await git.clone(cloneUrl, installPath, options.branch ? ['--branch', options.branch] : []);
    }
    
    // Read skill metadata if exists
    let metadata = {
      name: repo.repo,
      description: `Skills from ${repo.owner}/${repo.repo}`,
      version: '1.0.0',
      author: repo.owner,
      tags: []
    };
    
    const metadataPath = path.join(installPath, 'skills.json');
    if (await fs.pathExists(metadataPath)) {
      metadata = await fs.readJson(metadataPath);
    }
    
    // Save installation record
    const config = await getConfig();
    const existingIndex = config.skills.findIndex(
      s => s.metadata.name === metadata.name
    );
    
    const installedSkill: InstalledSkill = {
      metadata,
      installedPath: installPath,
      repository: `${repo.owner}/${repo.repo}`,
      installedAt: new Date().toISOString()
    };
    
    if (existingIndex >= 0) {
      config.skills[existingIndex] = installedSkill;
    } else {
      config.skills.push(installedSkill);
    }
    
    await saveConfig(config);
    
    spinner.succeed(chalk.green('Skills installed successfully!'));
    console.log(chalk.blue(`\nSkills location: ${installPath}`));
    console.log(chalk.yellow('Run `khmerskills sync` to update your AGENTS.md file'));
    
    // Auto-sync after install
    const { syncCommand } = require('./sync');
    await syncCommand();
    
  } catch (error) {
    spinner.fail(chalk.red('Installation failed'));
    console.error(error);
    process.exit(1);
  }
}
```

### 6. Read Command

**src/commands/read.ts:**
```typescript
import chalk from 'chalk';
import path from 'path';
import fs from 'fs-extra';
import { getConfig } from '../utils/skills';

export async function readCommand(skillName: string): Promise<void> {
  try {
    const config = await getConfig();
    const skill = config.skills.find(s => s.metadata.name === skillName);
    
    if (!skill) {
      console.error(chalk.red(`Skill '${skillName}' not found`));
      console.log(chalk.yellow('Use `khmerskills list` to see installed skills'));
      process.exit(1);
    }
    
    const skillPath = skill.installedPath;
    
    // Look for main instruction file
    const possibleFiles = [
      'SKILL.md',
      'skill.md',
      'README.md',
      'INSTRUCTIONS.md',
      'instructions.md'
    ];
    
    let content: string | null = null;
    let foundFile: string | null = null;
    
    for (const file of possibleFiles) {
      const fullPath = path.join(skillPath, file);
      if (await fs.pathExists(fullPath)) {
        content = await fs.readFile(fullPath, 'utf-8');
        foundFile = file;
        break;
      }
    }
    
    if (!content) {
      console.error(chalk.red('No instruction file found for this skill'));
      process.exit(1);
    }
    
    // Output in XML format for AI agents
    console.log(chalk.green(`\n=== Skill: ${skillName} ===\n`));
    console.log(`<skill name="${skillName}">`);
    console.log(`  <metadata>`);
    console.log(`    <description>${skill.metadata.description}</description>`);
    console.log(`    <author>${skill.metadata.author}</author>`);
    console.log(`    <version>${skill.metadata.version}</version>`);
    console.log(`  </metadata>`);
    console.log(`  <instructions>`);
    console.log(content.split('\n').map(line => `    ${line}`).join('\n'));
    console.log(`  </instructions>`);
    console.log(`</skill>`);
    
  } catch (error) {
    console.error(chalk.red('Error reading skill:'), error);
    process.exit(1);
  }
}
```

### 7. List Command

**src/commands/list.ts:**
```typescript
import chalk from 'chalk';
import { getConfig } from '../utils/skills';

export async function listCommand(options: { verbose?: boolean }): Promise<void> {
  try {
    const config = await getConfig();
    
    if (config.skills.length === 0) {
      console.log(chalk.yellow('No skills installed'));
      console.log(chalk.blue('Use `khmerskills install <owner/repo>` to install skills'));
      return;
    }
    
    console.log(chalk.bold.green('\nInstalled Skills:\n'));
    
    config.skills.forEach((skill, index) => {
      console.log(chalk.cyan(`${index + 1}. ${skill.metadata.name}`));
      console.log(`   Description: ${skill.metadata.description}`);
      console.log(`   Repository: ${skill.repository}`);
      console.log(`   Installed: ${new Date(skill.installedAt).toLocaleDateString()}`);
      
      if (options.verbose) {
        console.log(`   Version: ${skill.metadata.version}`);
        console.log(`   Author: ${skill.metadata.author}`);
        console.log(`   Tags: ${skill.metadata.tags.join(', ')}`);
        console.log(`   Path: ${skill.installedPath}`);
      }
      
      console.log('');
    });
    
  } catch (error) {
    console.error(chalk.red('Error listing skills:'), error);
    process.exit(1);
  }
}
```

### 8. Sync Command

**src/commands/sync.ts:**
```typescript
import ora from 'ora';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs-extra';
import { getConfig } from '../utils/skills';

export async function syncCommand(): Promise<void> {
  const spinner = ora('Syncing skills with AGENTS.md...').start();
  
  try {
    const config = await getConfig();
    const cwd = process.cwd();
    const agentsMdPath = path.join(cwd, 'AGENTS.md');
    
    // Generate skills XML section
    let skillsXml = '<!-- OPEN_SKILLS_START -->\n';
    skillsXml += '<!-- This section is auto-generated by khmerskills -->\n\n';
    skillsXml += '<available_skills>\n';
    
    for (const skill of config.skills) {
      skillsXml += `  <skill>\n`;
      skillsXml += `    <name>${skill.metadata.name}</name>\n`;
      skillsXml += `    <description>${skill.metadata.description}</description>\n`;
      skillsXml += `    <location>${skill.installedPath}</location>\n`;
      skillsXml += `    <repository>${skill.repository}</repository>\n`;
      skillsXml += `    <version>${skill.metadata.version}</version>\n`;
      
      if (skill.metadata.tags && skill.metadata.tags.length > 0) {
        skillsXml += `    <tags>${skill.metadata.tags.join(', ')}</tags>\n`;
      }
      
      skillsXml += `  </skill>\n`;
    }
    
    skillsXml += '</available_skills>\n';
    skillsXml += '<!-- OPEN_SKILLS_END -->\n';
    
    // Read or create AGENTS.md
    let agentsContent = '';
    if (await fs.pathExists(agentsMdPath)) {
      agentsContent = await fs.readFile(agentsMdPath, 'utf-8');
      
      // Replace existing skills section if present
      const startMarker = '<!-- OPEN_SKILLS_START -->';
      const endMarker = '<!-- OPEN_SKILLS_END -->';
      
      if (agentsContent.includes(startMarker)) {
        const startIndex = agentsContent.indexOf(startMarker);
        const endIndex = agentsContent.indexOf(endMarker) + endMarker.length;
        agentsContent = agentsContent.substring(0, startIndex) + 
                       skillsXml + 
                       agentsContent.substring(endIndex);
      } else {
        // Append to the end
        agentsContent += '\n\n' + skillsXml;
      }
    } else {
      // Create new AGENTS.md
      agentsContent = `# AGENTS.md\n\n`;
      agentsContent += `This file provides instructions and available skills for AI coding agents.\n\n`;
      agentsContent += skillsXml;
    }
    
    // Add instructions on how to use skills
    if (!agentsContent.includes('## How to Use Skills')) {
      agentsContent += `\n## How to Use Skills\n\n`;
      agentsContent += `To load a specific skill, use the following command:\n\n`;
      agentsContent += `\`\`\`bash\n`;
      agentsContent += `khmerskills read <skill-name>\n`;
      agentsContent += `\`\`\`\n\n`;
      agentsContent += `For example:\n`;
      agentsContent += `\`\`\`bash\n`;
      agentsContent += `khmerskills read code-review\n`;
      agentsContent += `\`\`\`\n`;
    }
    
    await fs.writeFile(agentsMdPath, agentsContent);
    
    spinner.succeed(chalk.green('AGENTS.md updated successfully!'));
    console.log(chalk.blue(`\nSkills synced to: ${agentsMdPath}`));
    
  } catch (error) {
    spinner.fail(chalk.red('Sync failed'));
    console.error(error);
    process.exit(1);
  }
}
```

### 9. Remove Command

**src/commands/remove.ts:**
```typescript
import ora from 'ora';
import chalk from 'chalk';
import fs from 'fs-extra';
import { getConfig, saveConfig } from '../utils/skills';

export async function removeCommand(skillName: string, options: { all?: boolean }): Promise<void> {
  const spinner = ora('Removing skills...').start();
  
  try {
    const config = await getConfig();
    
    if (options.all) {
      // Remove all skills
      for (const skill of config.skills) {
        if (await fs.pathExists(skill.installedPath)) {
          await fs.remove(skill.installedPath);
        }
      }
      
      config.skills = [];
      await saveConfig(config);
      
      spinner.succeed(chalk.green('All skills removed successfully'));
      return;
    }
    
    const skillIndex = config.skills.findIndex(s => s.metadata.name === skillName);
    
    if (skillIndex === -1) {
      spinner.fail(chalk.red(`Skill '${skillName}' not found`));
      console.log(chalk.yellow('Use `khmerskills list` to see installed skills'));
      process.exit(1);
    }
    
    const skill = config.skills[skillIndex];
    
    // Remove skill files
    if (await fs.pathExists(skill.installedPath)) {
      await fs.remove(skill.installedPath);
    }
    
    // Update config
    config.skills.splice(skillIndex, 1);
    await saveConfig(config);
    
    spinner.succeed(chalk.green(`Skill '${skillName}' removed successfully`));
    
    // Auto-sync after remove
    const { syncCommand } = require('./sync');
    await syncCommand();
    
  } catch (error) {
    spinner.fail(chalk.red('Remove failed'));
    console.error(error);
    process.exit(1);
  }
}
```

### 10. Utility Functions

**src/utils/skills.ts:**
```typescript
import path from 'path';
import fs from 'fs-extra';
import os from 'os';
import { SkillsConfig } from '../types';

const CONFIG_FILE = 'khmerskills.json';

export function getSkillsDir(): string {
  const homeDir = os.homedir();
  return path.join(homeDir, '.khmerskills', 'skills');
}

export function getConfigPath(): string {
  return path.join(os.homedir(), '.khmerskills', CONFIG_FILE);
}

export async function getConfig(): Promise<SkillsConfig> {
  const configPath = getConfigPath();
  
  if (await fs.pathExists(configPath)) {
    return fs.readJson(configPath);
  }
  
  // Return default config
  return {
    skills: [],
    lastSync: new Date().toISOString()
  };
}

export async function saveConfig(config: SkillsConfig): Promise<void> {
  const configPath = getConfigPath();
  await fs.ensureDir(path.dirname(configPath));
  await fs.writeJson(configPath, config, { spaces: 2 });
}
```

### 11. README Documentation

**README.md:**
```markdown
# Khmerskills - Universal AI Agent Skills Loader

A universal skills loader that makes AI agent skills (from Anthropic's Claude) work with any coding agent like GitHub Copilot, Cursor, or any AI that can read files.

## Installation

```bash
npm install -g khmerskills
```

## Commands

### Install Skills
```bash
khmerskills install owner/repository
# or
openskills install numman-ali/openskills
```

### List Installed Skills
```bash
khmerskills list
khmerskills list --verbose  # Show detailed info
```

### Read a Skill
```bash
khmerskills read code-review
```

### Sync Skills with Project
```bash
khmerskills sync
```

### Remove Skills
```bash
khmerskills remove code-review
khmerskills remove --all  # Remove all skills
```

## How It Works

1. Skills are downloaded from GitHub repositories
2. The tool maintains a config file with installed skills
3. Running `sync` updates the project's AGENTS.md with XML-formatted skill listings
4. AI agents read AGENTS.md to discover available skills
5. Agents can use `khmerskills read <skill-name>` to load specific instructions

## AGENTS.md Format

The tool generates/updates an AGENTS.md file with:

```xml
<available_skills>
  <skill>
    <name>code-review</name>
    <description>Code review best practices</description>
    <location>/path/to/skill</location>
    <repository>owner/repo</repository>
    <version>1.0.0</version>
  </skill>
</available_skills>
```

## Skill Repository Format

Each skill repository should contain:
- A main instruction file (SKILL.md, README.md, or INSTRUCTIONS.md)
- Optional `skills.json` with metadata

## Development

```bash
git clone <this-repo>
cd khmerskills
npm install
npm run build
npm link  # For local testing
```

## License

MIT
```

This implementation provides a complete command-line tool that:

1. **Installs skills** from GitHub repositories
2. **Generates AGENTS.md** with XML-formatted skill listings that AI agents can parse
3. **Reads specific skills** using the `read` command that outputs structured XML
4. **Manages skills** with list, sync, and remove commands
5. **Works universally** with any AI coding agent that can read files and execute commands

The key innovation is the AGENTS.md file approach - it creates a standard interface that any AI agent can understand, whether it's Claude, Copilot, or another system. The XML format makes skills easily parseable while remaining human-readable.