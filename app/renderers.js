function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderList(items = [], emptyMessage = '항목이 없습니다.') {
  if (!items.length) {
    return `<p class="muted">${escapeHtml(emptyMessage)}</p>`;
  }

  const listItems = items
    .map((item) => {
      const note = item.note ? `<p class="item-note">${escapeHtml(item.note)}</p>` : '';
      const desc = item.desc ? `<p class="item-note">${escapeHtml(item.desc)}</p>` : '';
      const href = item.url ? `<a href="${escapeHtml(item.url)}" target="_blank" rel="noreferrer">원문 보기 ↗</a>` : '';
      return `
        <li class="briefing-item">
          <div class="item-main">
            <strong>${escapeHtml(item.title)}</strong>
            ${note || desc}
          </div>
          <div class="item-link">${href}</div>
        </li>
      `;
    })
    .join('');

  return `<ul class="briefing-list">${listItems}</ul>`;
}

function renderBriefingHtml(briefing) {
  const {
    title,
    date,
    createdAt,
    summary,
    sections = {},
    prevUrl,
    nextUrl,
  } = briefing;

  return `<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
    <link rel="stylesheet" href="/assets/style.css" />
  </head>
  <body class="detail-page">
    <main class="container">
      <header class="hero detail-hero">
        <a class="ghost-link" href="/">← 목록으로</a>
        <p class="eyebrow">${escapeHtml(date)}</p>
        <h1>${escapeHtml(title)}</h1>
        <p class="hero-summary">${escapeHtml(summary)}</p>
        <p class="meta">생성 시각 · ${escapeHtml(createdAt)}</p>
      </header>

      <section class="card">
        <h2>오늘 일정</h2>
        ${renderList(sections.calendar, '오늘 등록된 일정이 없습니다.')}
      </section>

      <section class="card">
        <h2>중요 메일</h2>
        ${renderList(sections.importantMail, '중요 메일이 없습니다.')}
        <h3>인박스에서 볼 만한 것</h3>
        ${renderList(sections.inboxPicks, '인박스 추천 메일이 없습니다.')}
      </section>

      <section class="card two-column-section">
        <div>
          <h2>GeekNews</h2>
          ${renderList(sections.geekNews, 'GeekNews 항목이 없습니다.')}
        </div>
        <div>
          <h2>Hacker News</h2>
          ${renderList(sections.hackerNews, 'Hacker News 항목이 없습니다.')}
        </div>
      </section>

      <section class="card">
        <h2>마켓</h2>
        ${renderList(sections.market, '마켓 데이터 연동 대기 중입니다.')}
      </section>

      <section class="card">
        <h2>오늘의 포커스</h2>
        ${renderList(sections.focus, '오늘의 포커스가 아직 없습니다.')}
      </section>

      <nav class="detail-nav card">
        <div>${prevUrl ? `<a href="${escapeHtml(prevUrl)}">← 이전 브리핑</a>` : '<span class="muted">이전 브리핑 없음</span>'}</div>
        <div>${nextUrl ? `<a href="${escapeHtml(nextUrl)}">다음 브리핑 →</a>` : '<span class="muted">다음 브리핑 없음</span>'}</div>
      </nav>
    </main>
  </body>
</html>`;
}

module.exports = {
  renderBriefingHtml,
};
