import ora from 'ora';
import chalk from 'chalk';
import { getConfig } from '../utils/skills';
import { updateAgentsMd } from '../utils/agents-md';

export async function syncCommand(): Promise<void> {
  const spinner = ora('Syncing skills with AGENTS.md...').start();
  
  try {
    const config = await getConfig();
    const agentsMdPath = await updateAgentsMd({ skills: config.skills });
    
    spinner.succeed(chalk.green('AGENTS.md updated successfully!'));
    console.log(chalk.blue(`\nSkills synced to: ${agentsMdPath}`));
    
  } catch (error) {
    spinner.fail(chalk.red('Sync failed'));
    console.error(error);
    process.exit(1);
  }
}