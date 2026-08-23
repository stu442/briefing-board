import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

import { getJournalVaultPath } from '@/lib/journal';

const execFileAsync = promisify(execFile);
const GIT_TIMEOUT_MS = 20_000;

type GitCommandError = Error & { stderr?: string; stdout?: string };

export type JournalGitStatus = {
  clean: boolean;
  ahead: number;
  behind: number;
  branch: string;
  remote: string;
};

async function git(args: string[]) {
  try {
    const { stdout } = await execFileAsync('git', args, {
      cwd: getJournalVaultPath(),
      timeout: GIT_TIMEOUT_MS,
      maxBuffer: 1024 * 1024,
    });
    return stdout.trim();
  } catch (error) {
    const gitError = error as GitCommandError;
    throw new Error(gitError.stderr?.trim() || gitError.stdout?.trim() || gitError.message);
  }
}

export async function getJournalGitStatus(): Promise<JournalGitStatus> {
  const [changes, branch, remote, divergence] = await Promise.all([
    git(['status', '--porcelain']),
    git(['branch', '--show-current']),
    git(['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{upstream}']),
    git(['rev-list', '--left-right', '--count', 'HEAD...@{upstream}']),
  ]);
  const [aheadRaw = '0', behindRaw = '0'] = divergence.split(/\s+/);

  return {
    clean: changes.length === 0,
    ahead: Number(aheadRaw),
    behind: Number(behindRaw),
    branch,
    remote,
  };
}

export async function pullJournalVault() {
  const status = await getJournalGitStatus();
  if (!status.clean) {
    throw new Error('로컬 저널 변경이 있어 Pull을 막았어. 먼저 Push로 백업해줘.');
  }
  if (status.ahead > 0) {
    throw new Error('GitHub에 아직 올리지 않은 커밋이 있어. 먼저 Push해줘.');
  }

  await git(['pull', '--ff-only', 'origin', 'main']);
  return getJournalGitStatus();
}

export async function pushJournalVault() {
  const before = await getJournalGitStatus();
  if (!before.clean) {
    await git(['add', '--all']);
    await git(['commit', '-m', 'journal backup']);
  }

  await git(['push', 'origin', 'main']);
  return getJournalGitStatus();
}
