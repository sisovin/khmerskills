#!/usr/bin/env node

import { Command } from 'commander';
import { installCommand } from './commands/install';
import { readCommand } from './commands/read';
import { listCommand } from './commands/list';
import { syncCommand } from './commands/sync';
import { removeCommand } from './commands/remove';

const program = new Command();

program
  .name('khmetskills')
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