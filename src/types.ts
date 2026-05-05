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