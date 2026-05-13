const path = require('path');
const express = require('express');
const { listBriefings } = require('./db');

const app = express();
const port = Number(process.env.PORT || 3087);
const host = process.env.HOST || '0.0.0.0';

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use('/assets', express.static(path.join(__dirname, '..', 'public', 'assets')));
app.use('/briefings', express.static(path.join(__dirname, '..', 'public', 'briefings')));

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/', (_req, res) => {
  const briefings = listBriefings(60);
  res.render('index', {
    pageTitle: '민수 브리핑',
    briefings,
    generatedAt: new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
  });
});

app.listen(port, host, () => {
  console.log(`Briefing board listening on http://${host}:${port}`);
});
