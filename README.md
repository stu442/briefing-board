# briefing-board

Tailscale 내부에서만 열어보는 개인 브리핑 게시판.

## 스택
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- shadcn-style UI primitives
- SQLite (`better-sqlite3`)

## 구조
```text
app/
  briefings/[slug]/page.tsx
  health/route.ts
  globals.css
  layout.tsx
  page.tsx
components/
  ui/
content/
  briefings/
lib/
  briefings.ts
  db.ts
  utils.ts
data/
  briefings.db
scripts/
  generate-briefing.js
  merge-briefing.js
runtime/
seeds/
```

## 실행
```bash
cd ~/Project/briefing-board
npm install
npm run build
npm start
```

개발 서버:
```bash
npm run dev
```

브라우저:
- 홈: `http://<tailscale-ip>:3087/`
- 오늘 브리핑: `http://<tailscale-ip>:3087/briefings/2026-05-13.html`
- 헬스체크: `http://<tailscale-ip>:3087/health`

## 브리핑 데이터 흐름
- 실제 콘텐츠 원본: `content/briefings/YYYY-MM-DD.json`
- 메타데이터 인덱스: `data/briefings.db`
- 홈과 상세 페이지는 Next.js가 서버에서 읽어 렌더링
- URL은 계속 `/briefings/YYYY-MM-DD.html` 형태 유지

## 새 브리핑 추가
JSON 파일 하나 만든 뒤 generate 스크립트에 넘기면 됨.

```bash
node scripts/generate-briefing.js /absolute/path/to/briefing.json
```

기존 날짜 페이지에 일부 섹션만 merge:
```bash
node scripts/merge-briefing.js /absolute/path/to/patch.json
```

예시 patch:
```json
{
  "date": "2026-05-14 목요일",
  "slug": "2026-05-14",
  "sections": {
    "geekNews": [
      {
        "title": "Claude Code 에도 /goal 기능 추가",
        "discussionUrl": "https://news.hada.io/topic?id=12345",
        "originalUrl": "https://code.claude.com/docs/ko/goal",
        "note": "긱뉴스 토론 페이지로 먼저 보내고, 필요하면 원문도 열 수 있게"
      }
    ]
  }
}
```

## 홈서버 운영
현재 user systemd 서비스로 띄우는 기준.

서비스 상태 확인:
```bash
systemctl --user status briefing-board.service
```

설정 파일:
```text
~/.config/systemd/user/briefing-board.service
```

서비스 반영 순서:
```bash
cd ~/Project/briefing-board
npm run build
systemctl --user restart briefing-board.service
```

## cron 연동 방식
- 오전 브리핑 cron: 오늘 JSON 생성/merge 후 링크 전송
- 시장 브리핑 cron: `npm run market`으로 실시간 시세를 가져와 같은 날짜 JSON의 `market` 섹션만 갱신
- 즉, 하루에 페이지 하나를 누적 업데이트하는 구조

## 마켓 데이터 소스
- `yahoo-finance2` 사용
- 수집 대상:
  - crypto: BTC, ETH
  - ETFs: VOO, QLD, QQQM, JEPI, JEPQ
  - FX: USD/KRW, JPY/KRW
- ETF 항목에는 RSI(14), MA20, MA60, MA120 포함
- 실행:
```bash
cd ~/Project/briefing-board
npm run market
```

## 다음 단계 아이디어
- 실제 shadcn/ui 초기화 + 컴포넌트 더 확장
- 월별 아카이브 / 검색 / 읽음 표시
- 마켓 차트 시각화
- 브리핑 생성 스크립트 TS로 정리
