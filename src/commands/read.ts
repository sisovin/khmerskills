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