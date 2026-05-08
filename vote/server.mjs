import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import QRCode from 'qrcode';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadConfig() {
  const configPath = path.join(__dirname, 'config.json');
  const examplePath = path.join(__dirname, 'config.example.json');
  const from = fs.existsSync(configPath) ? configPath : examplePath;
  const raw = fs.readFileSync(from, 'utf8');
  const cfg = JSON.parse(raw);
  if (!cfg.title || !Array.isArray(cfg.choices) || cfg.choices.length < 2) {
    throw new Error('config: title et au moins 2 choix requis');
  }
  return {
    title: String(cfg.title),
    choices: cfg.choices.map(String),
    port: Number(cfg.port) || 3847,
  };
}

function getLanIPv4() {
  const nets = os.networkInterfaces();
  for (const list of Object.values(nets)) {
    for (const n of list || []) {
      if (n.family === 'IPv4' && !n.internal) return n.address;
    }
  }
  return '127.0.0.1';
}

function parseCookies(header) {
  const out = {};
  if (!header) return out;
  for (const part of header.split(';')) {
    const [k, ...rest] = part.trim().split('=');
    if (k) out[k] = decodeURIComponent(rest.join('=') || '');
  }
  return out;
}

function send(res, status, body, headers = {}) {
  res.writeHead(status, {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-store',
    ...headers,
  });
  res.end(body);
}

function sendJson(res, status, obj, headers = {}) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    ...headers,
  });
  res.end(JSON.stringify(obj));
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const SESSION_COOKIE = 'vote_session';
const COOKIE_OPTS = 'Path=/; HttpOnly; SameSite=Lax; Max-Age=86400';

/** @type {{ counts: number[], voters: Set<string> }} */
const state = {
  counts: [],
  voters: new Set(),
};

function ensureStateSize(n) {
  if (state.counts.length !== n) {
    state.counts = Array.from({ length: n }, () => 0);
    state.voters.clear();
  }
}

function pageShell(title, inner) {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <style>
    :root {
      --bg: #0f1419;
      --surface: #1a2332;
      --text: #e7eef8;
      --muted: #8b9cb3;
      --accent: #3d9cf5;
      --ok: #3ecf8e;
    }
    * { box-sizing: border-box; }
    body {
      font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
      margin: 0; min-height: 100vh;
      background: var(--bg); color: var(--text);
      padding: 1rem 1rem 2rem;
    }
    .wrap { max-width: 32rem; margin: 0 auto; }
    h1 { font-size: 1.35rem; font-weight: 600; margin: 0 0 0.5rem; }
    p.sub { color: var(--muted); margin: 0 0 1.25rem; font-size: 0.95rem; }
    .card {
      background: var(--surface);
      border-radius: 12px;
      padding: 1rem 1.1rem;
      margin-bottom: 1rem;
      border: 1px solid rgba(255,255,255,.06);
    }
    button, .btn {
      display: block; width: 100%;
      padding: 0.85rem 1rem;
      margin: 0 0 0.6rem;
      font-size: 1rem;
      border: none; border-radius: 10px;
      background: var(--accent); color: #fff;
      cursor: pointer; font-weight: 600;
    }
    button:disabled { opacity: 0.5; cursor: not-allowed; }
    button.secondary { background: #334155; color: var(--text); }
    .qr-wrap { text-align: center; padding: 0.5rem 0; }
    .qr-wrap img { max-width: 100%; height: auto; border-radius: 8px; background: #fff; padding: 8px; }
    .url { word-break: break-all; font-size: 0.85rem; color: var(--muted); }
    .bar-row { display: flex; align-items: center; gap: 0.5rem; margin: 0.35rem 0; }
    .bar-name { flex: 0 0 38%; font-size: 0.9rem; }
    .bar-track { flex: 1; height: 10px; background: rgba(255,255,255,.08); border-radius: 6px; overflow: hidden; }
    .bar-fill { height: 100%; background: var(--ok); border-radius: 6px; transition: width 0.3s ease; }
    .bar-n { flex: 0 0 2rem; text-align: right; font-variant-numeric: tabular-nums; font-size: 0.9rem; }
    .ok { color: var(--ok); font-weight: 600; margin-top: 0.75rem; }
    .err { color: #f87171; margin-top: 0.5rem; font-size: 0.9rem; }
  </style>
</head>
<body>
  <div class="wrap">${inner}</div>
</body>
</html>`;
}

function buildOrganizerPage(cfg, voterUrl, svgQr) {
  const inner = `
  <h1>Organisation — vote local</h1>
  <p class="sub">${escapeHtml(cfg.title)} — Les téléphones sur le même réseau ouvrent l’URL ou scannent le QR (pas d’hébergement Internet).</p>
  <div class="card">
    <div class="qr-wrap">${svgQr}</div>
    <p class="url"><strong>URL votants :</strong><br>${escapeHtml(voterUrl)}</p>
  </div>
  <div class="card">
    <h1 style="font-size:1.1rem">Résultats</h1>
    <div id="bars"></div>
    <p id="total" class="sub" style="margin-bottom:0"></p>
    <button type="button" class="secondary" id="reset">Réinitialiser les votes</button>
    <p id="reset-msg" class="err"></p>
  </div>
  <script>
    const choiceLabels = ${JSON.stringify(cfg.choices)};
    async function poll() {
      const r = await fetch('/api/results');
      const d = await r.json();
      const max = Math.max(1, ...d.counts);
      const bars = document.getElementById('bars');
      bars.innerHTML = choiceLabels.map((label, i) => {
        const n = d.counts[i] || 0;
        const pct = (n / max) * 100;
        return '<div class="bar-row"><div class="bar-name">' + label.replace(/</g,'&lt;') + '</div>' +
          '<div class="bar-track"><div class="bar-fill" style="width:' + pct + '%"></div></div>' +
          '<div class="bar-n">' + n + '</div></div>';
      }).join('');
      document.getElementById('total').textContent = 'Total bulletins : ' + d.total;
    }
    poll();
    setInterval(poll, 2000);
    document.getElementById('reset').onclick = async () => {
      document.getElementById('reset-msg').textContent = '';
      const r = await fetch('/api/reset', { method: 'POST' });
      const j = await r.json();
      if (!j.ok) document.getElementById('reset-msg').textContent = j.error || 'Erreur';
      poll();
    };
  </script>`;
  return pageShell('Organisation — vote', inner);
}

function buildVoterPage(cfg, errorMsg) {
  const buttons = cfg.choices
    .map(
      (label, i) =>
        `<button type="button" data-i="${i}">${escapeHtml(label)}</button>`
    )
    .join('');
  const err = errorMsg ? `<p class="err">${escapeHtml(errorMsg)}</p>` : '';
  const inner = `
  <h1>${escapeHtml(cfg.title)}</h1>
  <p class="sub">Un seul vote par appareil (session locale).</p>
  <div class="card" id="panel">
    ${err}
    ${buttons}
  </div>
  <p id="done" class="ok" style="display:none">Merci, votre vote est enregistré.</p>
  <script>
    let voted = false;
    document.querySelectorAll('#panel button').forEach((btn) => {
      btn.addEventListener('click', async () => {
        if (voted) return;
        const i = Number(btn.getAttribute('data-i'));
        const r = await fetch('/api/vote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ choiceIndex: i })
        });
        const d = await r.json();
        if (d.ok) {
          voted = true;
          document.getElementById('panel').style.display = 'none';
          document.getElementById('done').style.display = 'block';
        } else {
          alert(d.error || 'Erreur');
        }
      });
    });
  </script>`;
  return pageShell(cfg.title, inner);
}

async function main() {
  const cfg = loadConfig();
  ensureStateSize(cfg.choices.length);

  const host = '0.0.0.0';
  const lan = getLanIPv4();
  const basePort = cfg.port;
  const voterPath = '/v';
  const voterUrl = `http://${lan}:${basePort}${voterPath}`;

  const svgQr = await QRCode.toString(voterUrl, { type: 'svg', margin: 2, width: 240 });

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);

    if (req.method === 'GET' && url.pathname === '/') {
      return send(res, 200, buildOrganizerPage(cfg, voterUrl, svgQr));
    }

    if (req.method === 'GET' && url.pathname === voterPath) {
      const cookies = parseCookies(req.headers.cookie);
      const sid = cookies[SESSION_COOKIE];
      if (sid && state.voters.has(sid)) {
        const thanks = pageShell(
          cfg.title,
          `<h1>${escapeHtml(cfg.title)}</h1><p class="ok">Vous avez déjà voté sur cet appareil.</p>`
        );
        return send(res, 200, thanks);
      }
      return send(res, 200, buildVoterPage(cfg));
    }

    if (req.method === 'GET' && url.pathname === '/api/results') {
      return sendJson(res, 200, {
        counts: [...state.counts],
        total: state.counts.reduce((a, b) => a + b, 0),
      });
    }

    if (req.method === 'POST' && url.pathname === '/api/reset') {
      state.counts = state.counts.map(() => 0);
      state.voters.clear();
      return sendJson(res, 200, { ok: true });
    }

    if (req.method === 'POST' && url.pathname === '/api/vote') {
      let body = '';
      for await (const chunk of req) body += chunk;
      let data;
      try {
        data = JSON.parse(body || '{}');
      } catch {
        return sendJson(res, 400, { ok: false, error: 'JSON invalide' });
      }
      const idx = Number(data.choiceIndex);
      if (!Number.isInteger(idx) || idx < 0 || idx >= cfg.choices.length) {
        return sendJson(res, 400, { ok: false, error: 'Choix invalide' });
      }

      const cookies = parseCookies(req.headers.cookie);
      let sid = cookies[SESSION_COOKIE];
      if (!sid || !/^[0-9a-f-]{36}$/i.test(sid)) sid = randomUUID();

      if (state.voters.has(sid)) {
        return sendJson(res, 403, { ok: false, error: 'Déjà voté' });
      }

      state.voters.add(sid);
      state.counts[idx] += 1;

      const setCookie = `${SESSION_COOKIE}=${encodeURIComponent(sid)}; ${COOKIE_OPTS}`;
      return sendJson(res, 200, { ok: true }, { 'Set-Cookie': setCookie });
    }

    if (req.method === 'GET' && url.pathname === '/favicon.ico') {
      res.writeHead(204).end();
      return;
    }

    send(res, 404, pageShell('404', '<h1>Introuvable</h1>'));
  });

  server.on('error', (err) => {
    if (err && err.code === 'EADDRINUSE') {
      console.error(
        'Port ' + basePort + ' déjà utilisé (autre instance du vote ou autre programme).\n' +
          '• Fermez l’autre fenêtre « npm start », ou\n' +
          '• Trouvez le PID : netstat -ano | findstr :' + basePort + '\n' +
          '• Ou changez le port dans config.json (clé « port »).'
      );
      process.exit(1);
      return;
    }
    console.error(err);
    process.exit(1);
  });

  server.listen(basePort, host, () => {
    console.log('');
    console.log('Vote local — écoute sur toutes les interfaces (' + host + ':' + basePort + ')');
    console.log('Organisateur (PC) : http://' + lan + ':' + basePort + '/');
    console.log('Lien / QR votants  : ' + voterUrl);
    console.log('');
    try {
      QRCode.toString(voterUrl, { type: 'terminal', small: true }, (err, out) => {
        if (!err && out) console.log(out);
      });
    } catch {
      /* ignore */
    }
    console.log('Ctrl+C pour arrêter.');
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
