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
      console.log(chalk.yellow('Use `khmetskills list` to see installed skills'));
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