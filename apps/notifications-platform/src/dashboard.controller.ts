import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('api/snapshot')
  snapshot() {
    return this.dashboardService.getSnapshot();
  }

  @Get()
  index(): string {
    return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Fintech Admin Panel</title>
    <style>
      :root {
        --bg: #0b1220;
        --panel: #111b2e;
        --muted: #9fb0cf;
        --text: #e8f0ff;
        --ok: #2ecc71;
        --bad: #ff5f6d;
        --line: #233455;
        --accent: #3aa6ff;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: "Segoe UI", "IBM Plex Sans", sans-serif;
        background: radial-gradient(1000px 400px at top right, #15345a 0%, var(--bg) 55%);
        color: var(--text);
      }
      .wrap { max-width: 1300px; margin: 0 auto; padding: 24px; }
      .head { display:flex; justify-content:space-between; align-items:center; margin-bottom: 16px; }
      .head h1 { margin:0; font-size: 28px; letter-spacing: .2px; }
      .muted { color: var(--muted); font-size: 13px; }
      .grid { display:grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
      .panel { background: var(--panel); border:1px solid var(--line); border-radius: 14px; padding: 14px; }
      .title { font-size: 12px; text-transform: uppercase; color: var(--muted); margin-bottom: 8px; }
      .status { font-size: 18px; font-weight: 700; }
      .ok { color: var(--ok); }
      .bad { color: var(--bad); }
      .section { margin-top: 14px; }
      table { width:100%; border-collapse: collapse; font-size: 13px; }
      th, td { border-bottom: 1px solid var(--line); padding: 8px 6px; text-align: left; }
      th { color: var(--muted); font-weight: 600; }
      .logs { display:grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
      .log-list { max-height: 320px; overflow: auto; display: grid; gap: 8px; }
      .log-item { border:1px solid var(--line); border-radius: 10px; padding: 8px; background:#0d1728; }
      .lvl-info { color:#7dd3fc; }
      .lvl-warn { color:#fbbf24; }
      .lvl-error { color:#f87171; }
      code { color: #c5ddff; }
      @media (max-width: 1050px) {
        .grid, .logs { grid-template-columns: 1fr; }
      }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="head">
        <h1>Fintech Admin Panel</h1>
        <div id="last" class="muted">Loading...</div>
      </div>
      <div class="grid">
        <div class="panel"><div class="title">Producer</div><div id="producer" class="status">-</div></div>
        <div class="panel"><div class="title">Consumer</div><div id="consumer" class="status">-</div></div>
        <div class="panel"><div class="title">Notifier</div><div id="notifier" class="status">-</div></div>
      </div>
      <div class="panel section">
        <div class="title">RabbitMQ Queues</div>
        <table>
          <thead><tr><th>Queue</th><th>Ready</th><th>Unacked</th><th>Total</th></tr></thead>
          <tbody id="queues"></tbody>
        </table>
      </div>
      <div class="logs section">
        <div class="panel"><div class="title">Producer Activity</div><div id="log-producer" class="log-list"></div></div>
        <div class="panel"><div class="title">Consumer Activity</div><div id="log-consumer" class="log-list"></div></div>
        <div class="panel"><div class="title">Notifier / Telegram</div><div id="log-notifier" class="log-list"></div></div>
      </div>
    </div>
    <script>
      const setStatus = (id, value) => {
        const el = document.getElementById(id);
        const ok = value === 'up';
        el.textContent = ok ? 'UP' : 'DOWN';
        el.className = 'status ' + (ok ? 'ok' : 'bad');
      };

      const renderLogs = (id, items) => {
        const root = document.getElementById(id);
        root.innerHTML = '';
        items.slice(0, 25).forEach((x) => {
          const div = document.createElement('div');
          div.className = 'log-item';
          div.innerHTML = '<div class="muted">' + x.ts + '</div>'
            + '<div class="lvl-' + x.level + '">[' + x.level.toUpperCase() + '] ' + x.message + '</div>'
            + (x.eventType ? '<div><code>' + x.eventType + '</code></div>' : '')
            + (x.eventId ? '<div><code>' + x.eventId + '</code></div>' : '');
          root.appendChild(div);
        });
      };

      async function refresh() {
        const res = await fetch('/api/snapshot');
        const data = await res.json();
        setStatus('producer', data.health.producer);
        setStatus('consumer', data.health.consumer);
        setStatus('notifier', data.health.notifier);
        document.getElementById('last').textContent = 'Updated: ' + new Date(data.timestamp).toLocaleString();

        document.getElementById('queues').innerHTML = data.queues
          .map((q) => '<tr><td>' + q.name + '</td><td>' + q.ready + '</td><td>' + q.unacked + '</td><td>' + q.total + '</td></tr>')
          .join('');

        renderLogs('log-producer', data.activity.producer || []);
        renderLogs('log-consumer', data.activity.consumer || []);
        renderLogs('log-notifier', data.activity.notifier || []);
      }

      refresh();
      setInterval(refresh, 3000);
    </script>
  </body>
</html>`;
  }
}
