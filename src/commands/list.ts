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