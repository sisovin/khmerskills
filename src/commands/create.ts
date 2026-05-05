import ora from 'ora';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs-extra';

interface CreateOptions {
  path?: string;
  force?: boolean;
}

interface SkillManifest {
  name: string;
  description: string;
  version: string;
  author: string;
  tags: string[];
  instructionsFile: string;
}

function getTargetDirectory(skillName: string, options: CreateOptions): string {
  if (options.path) {
    return path.resolve(options.path);
  }

  return path.resolve(process.cwd(), skillName);
}

function buildSkillManifest(skillName: string): SkillManifest {
  return {
    name: skillName,
    description: `${skillName} skill package for AI coding agents.`,
    version: '1.0.0',
    author: 'Your Name',
    tags: ['ai', 'skill'],
    instructionsFile: 'SKILL.md'
  };
}

function buildSkillMarkdown(skillName: string): string {
  return `# ${skillName}\n\n## Purpose\n\nDescribe what this skill helps agents accomplish.\n\n## When To Use\n\n- Add the situations where this skill should be loaded.\n\n## Expected Inputs\n\n- List required context or input fields.\n\n## Steps\n\n1. Define the process this skill should follow.\n2. Add any validation or guardrails.\n3. Define the expected output format.\n`;
}

function buildInstructionsMarkdown(skillName: string): string {
  return `# INSTRUCTIONS.md\n\n## ${skillName} Setup\n\n1. Keep instructions explicit and testable.\n2. Include concrete examples for common tasks.\n3. Update this file when behavior changes.\n\n## Testing\n\n- Validate with your target agent workflow.\n- Ensure command examples are executable.\n`;
}

export async function createCommand(skillName: string, options: CreateOptions): Promise<void> {
  const spinner = ora('Creating skill scaffold...').start();

  try {
    const normalizedName = skillName.trim();

    if (!normalizedName) {
      throw new Error('Skill name cannot be empty.');
    }

    const targetDir = getTargetDirectory(normalizedName, options);
    const exists = await fs.pathExists(targetDir);

    if (exists && !options.force) {
      throw new Error(`Target directory already exists: ${targetDir}. Use --force to overwrite files.`);
    }

    await fs.ensureDir(targetDir);

    const manifestPath = path.join(targetDir, 'skills.json');
    const skillPath = path.join(targetDir, 'SKILL.md');
    const instructionsPath = path.join(targetDir, 'INSTRUCTIONS.md');

    const manifest = buildSkillManifest(normalizedName);

    await fs.writeJson(manifestPath, manifest, { spaces: 2 });
    await fs.writeFile(skillPath, buildSkillMarkdown(normalizedName), 'utf-8');
    await fs.writeFile(instructionsPath, buildInstructionsMarkdown(normalizedName), 'utf-8');

    spinner.succeed(chalk.green('Skill scaffold created successfully!'));
    console.log(chalk.blue(`\nLocation: ${targetDir}`));
    console.log(chalk.cyan('Created files:'));
    console.log(`- ${manifestPath}`);
    console.log(`- ${skillPath}`);
    console.log(`- ${instructionsPath}`);
    console.log(chalk.yellow('\nNext steps:')); 
    console.log('1. Update skills.json metadata');
    console.log('2. Add real skill instructions in SKILL.md');
    console.log('3. Run `khmerskills install <owner/repo>` from your target project');
  } catch (error) {
    spinner.fail(chalk.red('Create failed'));
    console.error(error);
    process.exit(1);
  }
}
