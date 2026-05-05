import path from 'path';
import fs from 'fs-extra';
import simpleGit from 'simple-git';
import { GithubRepo } from '../types';

export interface CloneOrUpdateOptions {
	repository: string;
	skillsDir: string;
	branch?: string;
}

export interface CloneOrUpdateResult {
	repo: GithubRepo;
	cloneUrl: string;
	installPath: string;
	action: 'cloned' | 'updated';
}

export function parseGithubRepository(repository: string): GithubRepo {
	const normalized = repository.trim();

	if (!normalized) {
		throw new Error('Repository cannot be empty. Expected owner/repo.');
	}

	const cleanRepo = normalized
		.replace(/^(https?:\/\/)?github\.com\//i, '')
		.replace(/^git@github\.com:/i, '')
		.replace(/\.git$/i, '')
		.replace(/^\/+|\/+$/g, '');

	const [owner, repo] = cleanRepo.split('/');

	if (!owner || !repo) {
		throw new Error('Invalid GitHub repository format. Use owner/repo format.');
	}

	return { owner, repo };
}

export function getInstallPath(skillsDir: string, repo: GithubRepo): string {
	return path.join(skillsDir, repo.owner, repo.repo);
}

export function getCloneUrl(repo: GithubRepo): string {
	return `https://github.com/${repo.owner}/${repo.repo}.git`;
}

export async function cloneOrUpdateRepository(
	options: CloneOrUpdateOptions
): Promise<CloneOrUpdateResult> {
	const repo = parseGithubRepository(options.repository);
	const installPath = getInstallPath(options.skillsDir, repo);
	const cloneUrl = getCloneUrl(repo);

	await fs.ensureDir(options.skillsDir);

	const git = simpleGit();
	const exists = await fs.pathExists(installPath);

	if (exists) {
		await git.cwd(installPath).pull();

		return {
			repo,
			cloneUrl,
			installPath,
			action: 'updated'
		};
	}

	const cloneArgs = options.branch ? ['--branch', options.branch] : [];
	await git.clone(cloneUrl, installPath, cloneArgs);

	return {
		repo,
		cloneUrl,
		installPath,
		action: 'cloned'
	};
}
