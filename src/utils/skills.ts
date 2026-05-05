import path from 'path';
import fs from 'fs-extra';
import os from 'os';
import { SkillsConfig } from '../types';

const CONFIG_FILE = 'khmetskills.json';

export function getSkillsDir(): string {
  const homeDir = os.homedir();
  return path.join(homeDir, '.khmetskills', 'skills');
}

export function getConfigPath(): string {
  return path.join(os.homedir(), '.khmetskills', CONFIG_FILE);
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