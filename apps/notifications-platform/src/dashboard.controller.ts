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
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Fintech Control Center</title>
    <style>
      :root[data-theme='dark'] {
        --bg: #080f1f;
        --bg2: #0d1a33;
        --panel: rgba(16, 28, 56, 0.72);
        --panel-soft: rgba(14, 24, 46, 0.64);
        --line: rgba(125, 161, 255, 0.24);
        --text: #e8efff;
        --muted: #9bb2dc;
        --ok: #4ee39f;
        --bad: #ff7c97;
        --accent-a: #67d5ff;
        --accent-b: #8f85ff;
        --accent-c: #85f0a7;
      }

      :root[data-theme='light'] {
        --bg: #eff5ff;
        --bg2: #dff0ff;
        --panel: rgba(255, 255, 255, 0.74);
        --panel-soft: rgba(255, 255, 255, 0.82);
        --line: rgba(74, 116, 220, 0.24);
        --text: #1c2c4f;
        --muted: #5f75a4;
        --ok: #0da460;
        --bad: #d94368;
        --accent-a: #5dc2ff;
        --accent-b: #8f7bff;
        --accent-c: #56d88a;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        font-family: "Segoe UI", "IBM Plex Sans", sans-serif;
        background: linear-gradient(120deg, var(--bg), var(--bg2));
        color: var(--text);
        min-height: 100vh;
        overflow-x: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .bg-orb,
      .bg-orb::before,
      .bg-orb::after {
        position: fixed;
        content: '';
        border-radius: 50%;
        filter: blur(42px);
        z-index: -1;
        animation: breathe 10s ease-in-out infinite;
      }

      .bg-orb {
        width: 360px;
        height: 360px;
        top: -120px;
        left: -120px;
        background: radial-gradient(circle, var(--accent-a), transparent 62%);
      }

      .bg-orb::before {
        width: 460px;
        height: 460px;
        top: 280px;
        left: 70vw;
        background: radial-gradient(circle, var(--accent-b), transparent 66%);
        animation-delay: 1.8s;
      }

      .bg-orb::after {
        width: 300px;
        height: 300px;
        top: 70vh;
        left: 20vw;
        background: radial-gradient(circle, var(--accent-c), transparent 60%);
        animation-delay: 3.1s;
      }

      .bg-rings {
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: -1;
      }

      .ring {
        position: absolute;
        border-radius: 50%;
        border: 1px solid rgba(133, 213, 255, 0.16);
        box-shadow: 0 0 35px rgba(103, 213, 255, 0.12);
        animation: drift 18s linear infinite;
      }

      .ring.r1 {
        width: 280px;
        height: 280px;
        top: 14%;
        left: 7%;
        animation-duration: 22s;
      }

      .ring.r2 {
        width: 380px;
        height: 380px;
        top: 52%;
        left: 72%;
        border-color: rgba(143, 133, 255, 0.18);
        box-shadow: 0 0 40px rgba(143, 133, 255, 0.12);
        animation-duration: 26s;
      }

      .ring.r3 {
        width: 210px;
        height: 210px;
        top: 70%;
        left: 18%;
        border-color: rgba(133, 240, 167, 0.18);
        box-shadow: 0 0 34px rgba(133, 240, 167, 0.12);
        animation-duration: 19s;
      }

      @keyframes breathe {
        0%,
        100% {
          transform: translateY(0) scale(1);
          opacity: 0.35;
        }
        50% {
          transform: translateY(-14px) scale(1.09);
          opacity: 0.62;
        }
      }

      @keyframes drift {
        0% {
          transform: translate3d(0, 0, 0) rotate(0deg) scale(1);
          opacity: 0.45;
        }
        25% {
          transform: translate3d(14px, -10px, 0) rotate(90deg) scale(1.03);
          opacity: 0.62;
        }
        50% {
          transform: translate3d(0, -18px, 0) rotate(180deg) scale(0.98);
          opacity: 0.38;
        }
        75% {
          transform: translate3d(-12px, -8px, 0) rotate(270deg) scale(1.04);
          opacity: 0.58;
        }
        100% {
          transform: translate3d(0, 0, 0) rotate(360deg) scale(1);
          opacity: 0.45;
        }
      }

      .wrap {
        max-width: 1280px;
        width: min(1280px, calc(100vw - 32px));
        padding: 26px;
      }

      .head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        gap: 12px;
      }

      .head h1 {
        margin: 0;
        font-size: 34px;
        letter-spacing: 0.2px;
      }

      .subtitle {
        margin-top: 6px;
        color: var(--muted);
        font-size: 14px;
      }

      .head-right {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 8px;
      }

      .theme {
        border: 1px solid var(--line);
        border-radius: 999px;
        background: var(--panel-soft);
        color: var(--text);
        padding: 8px 12px;
        cursor: pointer;
      }

      .muted {
        color: var(--muted);
        font-size: 13px;
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 14px;
      }

      .panel {
        background: var(--panel);
        border: 1px solid var(--line);
        border-radius: 16px;
        padding: 14px;
        backdrop-filter: blur(10px);
        box-shadow: 0 12px 26px rgba(0, 0, 0, 0.14);
      }

      .kpi {
        min-height: 108px;
      }

      .title {
        font-size: 12px;
        text-transform: uppercase;
        color: var(--muted);
        margin-bottom: 8px;
        letter-spacing: 0.3px;
      }

      .status {
        font-size: 26px;
        font-weight: 700;
      }

      .ok {
        color: var(--ok);
      }

      .bad {
        color: var(--bad);
      }

      .section {
        margin-top: 14px;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        font-size: 13px;
      }

      th,
      td {
        border-bottom: 1px solid var(--line);
        padding: 10px 8px;
        text-align: left;
      }

      th {
        color: var(--muted);
        font-weight: 600;
      }

      .logs {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 14px;
      }

      .log-list {
        max-height: 330px;
        overflow: auto;
        display: grid;
        gap: 8px;
      }

      .log-item {
        border: 1px solid var(--line);
        border-radius: 10px;
        padding: 8px;
        background: var(--panel-soft);
      }

      .lvl-info {
        color: #4aa9ff;
      }

      .lvl-warn {
        color: #f59e0b;
      }

      .lvl-error {
        color: #ef4444;
      }

      .chips {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        margin-bottom: 10px;
      }

      .chip {
        border: 1px solid var(--line);
        padding: 5px 10px;
        border-radius: 999px;
        font-size: 12px;
        color: var(--muted);
      }

      .tabs {
        display: flex;
        gap: 8px;
        margin-top: 10px;
        margin-bottom: 12px;
        flex-wrap: wrap;
      }

      .tab-btn {
        border: 1px solid var(--line);
        border-radius: 999px;
        background: var(--panel-soft);
        color: var(--text);
        padding: 8px 14px;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .tab-btn.active {
        background: linear-gradient(120deg, var(--accent-a), var(--accent-b));
        color: #051126;
        border-color: transparent;
        font-weight: 600;
      }

      .tab-content {
        display: none;
      }

      .tab-content.active {
        display: block;
      }

      .embed {
        width: 100%;
        height: 74vh;
        border: 1px solid var(--line);
        border-radius: 16px;
        background: #0a1425;
      }

      .embed-note {
        margin-bottom: 10px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        flex-wrap: wrap;
      }

      .open-link {
        border: 1px solid var(--line);
        border-radius: 999px;
        padding: 6px 12px;
        text-decoration: none;
        color: var(--text);
        background: var(--panel-soft);
      }

      code {
        color: var(--text);
      }

      @media (max-width: 1050px) {
        .grid,
        .logs {
          grid-template-columns: 1fr;
        }
        .head {
          align-items: flex-start;
          flex-direction: column;
        }
        .head-right {
          align-items: flex-start;
        }
      }
    </style>
  </head>
  <body>
    <div class="bg-orb"></div>
    <div class="bg-rings" aria-hidden="true">
      <div class="ring r1"></div>
      <div class="ring r2"></div>
      <div class="ring r3"></div>
    </div>
    <div class="wrap">
      <div class="head">
        <div>
          <h1>Fintech Control Center</h1>
          <div class="subtitle">Операционный мониторинг событий, очередей и Telegram-уведомлений</div>
        </div>
        <div class="head-right">
          <button id="theme-toggle" class="theme">Тема: Dark</button>
          <div id="last" class="muted">Загрузка...</div>
        </div>
      </div>

      <div class="chips section">
        <div class="chip">Менеджерский вид</div>
        <div class="chip">Обновление каждые 3 сек</div>
        <div class="chip">Статусы: API / Processor / Telegram</div>
      </div>

      <div class="tabs">
        <button class="tab-btn active" data-tab="tab-admin">Админ панель</button>
        <button class="tab-btn" data-tab="tab-swagger">Swagger API</button>
        <button class="tab-btn" data-tab="tab-rabbit">RabbitMQ</button>
      </div>

      <div id="tab-admin" class="tab-content active">
      <div class="grid">
        <div class="panel kpi"><div class="title">API Приём Событий</div><div id="producer" class="status">-</div></div>
        <div class="panel kpi"><div class="title">Обработка и Маршрутизация</div><div id="consumer" class="status">-</div></div>
        <div class="panel kpi"><div class="title">Отправка в Telegram</div><div id="notifier" class="status">-</div></div>
      </div>

      <div class="panel section">
        <div class="title">Очереди RabbitMQ (операционное состояние)</div>
        <table>
          <thead><tr><th>Назначение</th><th>В очереди</th><th>В обработке</th><th>Всего</th></tr></thead>
          <tbody id="queues"></tbody>
        </table>
      </div>

      <div class="logs section">
        <div class="panel"><div class="title">Лента API событий</div><div id="log-producer" class="log-list"></div></div>
        <div class="panel"><div class="title">Лента обработки</div><div id="log-consumer" class="log-list"></div></div>
        <div class="panel"><div class="title">Лента уведомлений Telegram</div><div id="log-notifier" class="log-list"></div></div>
      </div>
      </div>

      <div id="tab-swagger" class="tab-content">
        <div class="panel embed-note muted">Встроенный Swagger Producer API (http://localhost:3001/api).</div>
        <iframe class="embed" src="http://localhost:3001/api" title="Swagger API"></iframe>
      </div>

      <div id="tab-rabbit" class="tab-content">
        <div class="panel embed-note muted">
          <span>Встроенный RabbitMQ UI через 127.0.0.1 (обход ошибки 431 из-за cookies localhost).</span>
          <a class="open-link" href="http://127.0.0.1:15672" target="_blank" rel="noopener noreferrer">Открыть RabbitMQ отдельно</a>
        </div>
        <iframe class="embed" src="http://127.0.0.1:15672" title="RabbitMQ UI"></iframe>
      </div>
    </div>
    <script>
      const queueNameMap = {
        'events.main.queue': 'Основная очередь событий',
        'events.retry.10s.queue': 'Повтор через 10 секунд',
        'events.retry.60s.queue': 'Повтор через 60 секунд',
        'events.dlq.queue': 'DLQ событий (ошибки)',
        'notify.main.queue': 'Очередь Telegram отправки',
        'notify.dlq.queue': 'DLQ уведомлений',
      };

      const root = document.documentElement;
      const tabs = Array.from(document.querySelectorAll('.tab-btn'));
      const themeButton = document.getElementById('theme-toggle');
      const savedTheme = localStorage.getItem('fintech-theme') || 'dark';
      root.setAttribute('data-theme', savedTheme);
      themeButton.textContent = 'Тема: ' + (savedTheme === 'dark' ? 'Dark' : 'Light');

      themeButton.addEventListener('click', () => {
        const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        root.setAttribute('data-theme', next);
        localStorage.setItem('fintech-theme', next);
        themeButton.textContent = 'Тема: ' + (next === 'dark' ? 'Dark' : 'Light');
      });

      tabs.forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-tab');
          tabs.forEach((x) => x.classList.remove('active'));
          document.querySelectorAll('.tab-content').forEach((x) => x.classList.remove('active'));
          btn.classList.add('active');
          document.getElementById(id).classList.add('active');
        });
      });

      const setStatus = (id, value) => {
        const el = document.getElementById(id);
        const ok = value === 'up';
        el.textContent = ok ? 'Работает' : 'Недоступно';
        el.className = 'status ' + (ok ? 'ok' : 'bad');
      };

      const renderLogs = (id, items) => {
        const root = document.getElementById(id);
        root.innerHTML = '';
        if (!items.length) {
          root.innerHTML = '<div class="muted">Пока нет новых записей</div>';
          return;
        }
        items.slice(0, 25).forEach((x) => {
          const div = document.createElement('div');
          div.className = 'log-item';
          div.innerHTML = '<div class="muted">' + new Date(x.ts).toLocaleString('ru-RU') + '</div>'
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
        document.getElementById('last').textContent = 'Обновлено: ' + new Date(data.timestamp).toLocaleString('ru-RU');

        document.getElementById('queues').innerHTML = data.queues
          .map((q) => '<tr><td>' + (queueNameMap[q.name] || q.name) + '</td><td>' + q.ready + '</td><td>' + q.unacked + '</td><td>' + q.total + '</td></tr>')
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
