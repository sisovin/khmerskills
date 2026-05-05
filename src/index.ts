#!/usr/bin/env node

import { Command } from 'commander';
import { installCommand } from './commands/install';
import { createCommand } from './commands/create';
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
  .command('create <skill-name>')
  .description('Create a new local skill scaffold')
  .option('-p, --path <path>', 'Output directory path (defaults to ./<skill-name>)')
  .option('-f, --force', 'Overwrite files in an existing target directory')
  .action(createCommand);

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