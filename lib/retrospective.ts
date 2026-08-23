import fs from 'node:fs';
import path from 'node:path';

import { getJournalVaultPath } from '@/lib/journal';

const KST_TIME_ZONE = 'Asia/Seoul';

export type RetrospectiveNote = {
  name: string;
  path: string;
  content: string;
  updatedAt: string;
};

export function getRetrospectiveDir() {
  return path.join(getJournalVaultPath(), '01-Daily', '회고');
}

function ensureRetrospectiveDir() {
  fs.mkdirSync(getRetrospectiveDir(), { recursive: true });
}

function safeNoteName(rawName: string) {
  const name = path.basename(rawName).replace(/\.md$/i, '').trim();
  if (!name || name === '.' || name === '..') throw new Error('Invalid retrospective note name');
  return `${name}.md`;
}

function formatKstParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: KST_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? '';
  return { year: get('year'), month: get('month'), day: get('day') };
}

export function getCurrentWeeklyRetrospectiveName(date = new Date()) {
  const { year, month, day } = formatKstParts(date);
  const week = Math.ceil(Number(day) / 7);
  return `${year}년 ${Number(month)}월 ${week}주차 회고.md`;
}

export function getWeeklyRetrospectiveTemplate(date = new Date()) {
  const { year, month, day } = formatKstParts(date);
  const week = Math.ceil(Number(day) / 7);
  return `# ${year}년 ${Number(month)}월 ${week}주차 회고

## 나와의 대화
- 이번 주 내 감정이나 생각을 잠깐이라도 들어줬나?
- 외면하거나 미룬 감정·문제가 있었나?

## 마음 · 건강 · 체력
- 전반적인 기분은 어땠나?
- 수면, 식사, 휴식에서 지금 가장 필요한 회복은?

## 환경 · 주변
- 공간, 사람, 일정 중 나를 소모시킨 것과 살게 한 것은 무엇이었나?

## 몸과 일의 밀도
- 운동/걷기/스트레칭은 몇 번 했나?
- 야근이나 과한 일정은 어디에서 생겼나?

## 다음 주를 위한 한 문장
-
`;
}

export function listRetrospectiveNotes(): RetrospectiveNote[] {
  ensureRetrospectiveDir();
  return fs.readdirSync(getRetrospectiveDir(), { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => {
      const notePath = path.join(getRetrospectiveDir(), entry.name);
      const stats = fs.statSync(notePath);
      return {
        name: entry.name,
        path: notePath,
        content: fs.readFileSync(notePath, 'utf8'),
        updatedAt: stats.mtime.toLocaleString('ko-KR', { timeZone: KST_TIME_ZONE }),
      };
    })
    .sort((a, b) => b.name.localeCompare(a.name, 'ko'));
}

export function readRetrospectiveNote(rawName: string) {
  const name = safeNoteName(rawName);
  const notePath = path.join(getRetrospectiveDir(), name);
  if (!fs.existsSync(notePath)) return null;
  const stats = fs.statSync(notePath);
  return { name, path: notePath, content: fs.readFileSync(notePath, 'utf8'), updatedAt: stats.mtime.toLocaleString('ko-KR', { timeZone: KST_TIME_ZONE }) };
}

export function saveRetrospectiveNote(rawName: string, content: string) {
  ensureRetrospectiveDir();
  const name = safeNoteName(rawName);
  const notePath = path.join(getRetrospectiveDir(), name);
  fs.writeFileSync(notePath, content.trimEnd() + '\n', 'utf8');
  return name;
}
