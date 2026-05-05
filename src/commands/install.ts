import ora from 'ora';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs-extra';
import { InstalledSkill } from '../types';
import { getSkillsDir, getConfig, saveConfig } from '../utils/skills';
import { cloneOrUpdateRepository } from '../utils/git';

export async function installCommand(repository: string, options: { branch?: string }): Promise<void> {
  const spinner = ora('Installing skills...').start();
  
  try {
    const skillsDir = getSkillsDir();
    spinner.text = `Installing from ${repository}...`;

    const gitResult = await cloneOrUpdateRepository({
      repository,
      skillsDir,
      branch: options.branch
    });

    const repo = gitResult.repo;
    const installPath = gitResult.installPath;
    const actionText = gitResult.action === 'cloned' ? 'cloned' : 'updated';

    spinner.text = `Repository ${actionText}: ${repo.owner}/${repo.repo}`;
    
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
    
    spinner.succeed(chalk.green(`Skills ${actionText} successfully!`));
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