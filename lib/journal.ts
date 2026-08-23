import fs from 'node:fs';
import path from 'node:path';

const KST_TIME_ZONE = 'Asia/Seoul';

function getDefaultTemplate() {
  return `# ${getTodayJournalSlug()}\n\n## 지금 상태\n- 에너지:\n- 감정:\n- 머리를 차지하는 것:\n\n## 오늘 있었던 일\n-\n\n## 지금 떠오르는 생각\n-\n\n## 내려놓을 것\n-\n\n## 내일의 한 가지\n-\n`;
}

export type JournalNoteSummary = {
  slug: string;
  title: string;
  href: string;
  updatedAt: string;
  preview: string;
  photoCount: number;
};

export type JournalImageBlock = {
  type: 'image';
  src: string;
  alt: string;
  originalPath: string;
};

export type JournalTextBlock = {
  type: 'heading' | 'paragraph' | 'list';
  level?: number;
  text?: string;
  items?: string[];
};

export type JournalBlock = JournalImageBlock | JournalTextBlock;

export function getJournalVaultPath() {
  return process.env.JOURNAL_VAULT_PATH || path.join(process.env.HOME || process.cwd(), 'Project', 'aurel-journal-vault');
}

export function getJournalDailyDir() {
  return path.join(getJournalVaultPath(), '01-Daily');
}

export function getJournalAttachmentDir() {
  return path.join(getJournalVaultPath(), '99-Attachments');
}

export function normalizeJournalSlug(rawSlug: string) {
  return rawSlug.replace(/\.md$/, '');
}

export function getJournalHref(slug: string) {
  return `/journal/${normalizeJournalSlug(slug)}`;
}

export function getTodayJournalSlug(date = new Date()) {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: KST_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export function getKstHourMinute(date = new Date()) {
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: KST_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

function getKstYearMonth(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: KST_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
  }).formatToParts(date);

  return {
    year: parts.find((part) => part.type === 'year')?.value ?? '0000',
    month: parts.find((part) => part.type === 'month')?.value ?? '00',
  };
}

function getKstStamp(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: KST_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(date);

  const read = (type: string) => parts.find((part) => part.type === type)?.value ?? '00';
  return `${read('year')}${read('month')}${read('day')}-${read('hour')}${read('minute')}${read('second')}`;
}

function ensureJournalDirectories() {
  fs.mkdirSync(getJournalDailyDir(), { recursive: true });
  fs.mkdirSync(getJournalAttachmentDir(), { recursive: true });
}

function getTemplatePath() {
  return path.join(getJournalDailyDir(), 'Journal Template.md');
}

function getTemplateContent() {
  const templatePath = getTemplatePath();
  if (fs.existsSync(templatePath)) {
    return fs.readFileSync(templatePath, 'utf8').trimEnd() + '\n';
  }

  return getDefaultTemplate();
}

export function getJournalNotePath(slug: string) {
  return path.join(getJournalDailyDir(), `${normalizeJournalSlug(slug)}.md`);
}

function findExistingJournalNotePath(slug: string, directory = getJournalDailyDir()): string | null {
  const normalizedSlug = normalizeJournalSlug(slug);
  const expectedName = `${normalizedSlug}.md`;

  if (!fs.existsSync(directory)) return null;

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isFile() && entry.name === expectedName) return entryPath;
    if (entry.isDirectory()) {
      const nestedMatch = findExistingJournalNotePath(normalizedSlug, entryPath);
      if (nestedMatch) return nestedMatch;
    }
  }

  return null;
}

function listJournalNotePaths(directory = getJournalDailyDir()): string[] {
  if (!fs.existsSync(directory)) return [];

  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return listJournalNotePaths(entryPath);
    return entry.isFile() && /^\d{4}-\d{2}-\d{2}\.md$/.test(entry.name) ? [entryPath] : [];
  });
}

export function journalNoteExists(slug: string) {
  return findExistingJournalNotePath(slug) !== null;
}

export function ensureJournalNote(slug = getTodayJournalSlug()) {
  ensureJournalDirectories();
  const notePath = findExistingJournalNotePath(slug) || getJournalNotePath(slug);
  if (!fs.existsSync(notePath)) {
    fs.writeFileSync(notePath, getTemplateContent(), 'utf8');
  }
  return notePath;
}

export function readJournalNote(slug: string) {
  const normalizedSlug = normalizeJournalSlug(slug);
  const notePath = findExistingJournalNotePath(normalizedSlug);
  if (!notePath) return null;

  const content = fs.readFileSync(notePath, 'utf8');
  const stats = fs.statSync(notePath);
  const photoCount = extractImageReferences(content).length;

  return {
    slug: normalizedSlug,
    title: `${normalizedSlug} journal`,
    href: getJournalHref(normalizedSlug),
    content,
    updatedAt: stats.mtime.toLocaleString('ko-KR', { timeZone: KST_TIME_ZONE }),
    photoCount,
  };
}

function buildPreview(content: string) {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#') && !line.startsWith('![[') && !line.startsWith('!['));

  return lines.slice(0, 3).join(' · ') || '아직 본문이 거의 없음';
}

export function listJournalNotes(limit = 20): JournalNoteSummary[] {
  ensureJournalDirectories();

  return listJournalNotePaths()
    .map((filePath) => {
      const slug = path.basename(filePath).replace(/\.md$/, '');
      const content = fs.readFileSync(filePath, 'utf8');
      const stats = fs.statSync(filePath);

      return {
        slug,
        title: `${slug} journal`,
        href: getJournalHref(slug),
        updatedAt: stats.mtime.toLocaleString('ko-KR', { timeZone: KST_TIME_ZONE }),
        preview: buildPreview(content),
        photoCount: extractImageReferences(content).length,
      };
    })
    .sort((a, b) => b.slug.localeCompare(a.slug))
    .slice(0, limit);
}

function sanitizeFileName(fileName: string) {
  const ext = path.extname(fileName).toLowerCase();
  const base = path.basename(fileName, ext).toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/-+/g, '-').replace(/^[-.]+|[-.]+$/g, '') || 'photo';
  return { base: base.slice(0, 48), ext: ext.slice(0, 10) };
}

export function saveJournalPhoto(args: { originalName: string; bytes: Uint8Array; date?: Date }) {
  const date = args.date ?? new Date();
  ensureJournalDirectories();
  const { year, month } = getKstYearMonth(date);
  const relativeDir = path.posix.join(year, month);
  const absoluteDir = path.join(getJournalAttachmentDir(), year, month);
  fs.mkdirSync(absoluteDir, { recursive: true });

  const { base, ext } = sanitizeFileName(args.originalName);
  const fileName = `${getKstStamp(date)}-${base}${ext || '.jpg'}`;
  const absolutePath = path.join(absoluteDir, fileName);
  fs.writeFileSync(absolutePath, Buffer.from(args.bytes));

  return {
    fileName,
    absolutePath,
    obsidianPath: path.posix.join('99-Attachments', relativeDir, fileName),
    publicPath: `/journal-media/${relativeDir}/${encodeURIComponent(fileName)}`,
  };
}

export function appendJournalEntry(args: { slug?: string; text?: string; photoPaths?: string[]; date?: Date }) {
  const date = args.date ?? new Date();
  const slug = normalizeJournalSlug(args.slug || getTodayJournalSlug(date));
  const notePath = ensureJournalNote(slug);
  const trimmedText = (args.text || '').trim();
  const photoPaths = (args.photoPaths || []).filter(Boolean);

  if (!trimmedText && photoPaths.length === 0) {
    return { slug, notePath, appended: false, photoCount: 0 };
  }

  const chunks: string[] = [];
  chunks.push('', `## ${getKstHourMinute(date)}`, '');
  if (trimmedText) {
    chunks.push(trimmedText, '');
  }
  if (photoPaths.length) {
    photoPaths.forEach((photoPath) => {
      chunks.push(`![[${photoPath}]]`);
    });
    chunks.push('');
  }

  fs.appendFileSync(notePath, `${chunks.join('\n')}\n`, 'utf8');
  return { slug, notePath, appended: true, photoCount: photoPaths.length };
}

export function resolveJournalMediaPath(originalPath: string) {
  const normalized = originalPath.replace(/^\.\//, '').replace(/^\/+/, '').replace(/\\/g, '/');
  const attachmentRoot = getJournalAttachmentDir();
  const withoutPrefix = normalized.replace(/^99-Attachments\//, '');
  const absolutePath = path.resolve(attachmentRoot, withoutPrefix);

  if (!absolutePath.startsWith(path.resolve(attachmentRoot) + path.sep) && absolutePath !== path.resolve(attachmentRoot)) {
    return null;
  }

  return absolutePath;
}

export function extractImageReferences(content: string) {
  const refs: string[] = [];
  const wikiMatches = content.matchAll(/!\[\[([^\]]+)\]\]/g);
  for (const match of wikiMatches) {
    refs.push(match[1]);
  }

  const markdownMatches = content.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g);
  for (const match of markdownMatches) {
    refs.push(match[1]);
  }

  return refs;
}

function toPublicMediaPath(originalPath: string) {
  const normalized = originalPath.replace(/\\/g, '/').replace(/^\.\//, '').replace(/^99-Attachments\//, '');
  return `/journal-media/${normalized.split('/').map(encodeURIComponent).join('/')}`;
}

export function parseJournalContent(content: string): JournalBlock[] {
  const blocks: JournalBlock[] = [];
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  let paragraphBuffer: string[] = [];
  let listBuffer: string[] = [];

  const flushParagraph = () => {
    if (!paragraphBuffer.length) return;
    blocks.push({ type: 'paragraph', text: paragraphBuffer.join(' ') });
    paragraphBuffer = [];
  };

  const flushList = () => {
    if (!listBuffer.length) return;
    blocks.push({ type: 'list', items: listBuffer });
    listBuffer = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }

    const wikiImageMatch = line.match(/^!\[\[([^\]]+)\]\]$/);
    if (wikiImageMatch) {
      flushParagraph();
      flushList();
      const originalPath = wikiImageMatch[1];
      const fileName = path.basename(originalPath);
      blocks.push({ type: 'image', src: toPublicMediaPath(originalPath), alt: fileName, originalPath });
      continue;
    }

    const markdownImageMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (markdownImageMatch) {
      flushParagraph();
      flushList();
      const originalPath = markdownImageMatch[2];
      blocks.push({ type: 'image', src: toPublicMediaPath(originalPath), alt: markdownImageMatch[1] || path.basename(originalPath), originalPath });
      continue;
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      flushParagraph();
      flushList();
      blocks.push({ type: 'heading', level: headingMatch[1].length, text: headingMatch[2] });
      continue;
    }

    const listMatch = line.match(/^[-*]\s+(.+)$/);
    if (listMatch) {
      flushParagraph();
      listBuffer.push(listMatch[1]);
      continue;
    }

    flushList();
    paragraphBuffer.push(line);
  }

  flushParagraph();
  flushList();
  return blocks;
}
