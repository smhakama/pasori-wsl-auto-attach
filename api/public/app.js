const userForm = document.getElementById('user-form');
const tapForm = document.getElementById('tap-form');
const logsBody = document.getElementById('logs-body');
const statusEl = document.getElementById('status');
const tapResultEl = document.getElementById('tap-result');
const reloadBtn = document.getElementById('reload');

function setStatus(message) {
  statusEl.textContent = message;
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderLogs(logs) {
  if (!Array.isArray(logs) || logs.length === 0) {
    logsBody.innerHTML = '<tr><td colspan="5">ログはまだありません。</td></tr>';
    return;
  }

  logsBody.innerHTML = logs
    .map((log) => {
      const name = log.name || '';
      const isUnregistered = !name;
      return `<tr${isUnregistered ? ' class="unregistered"' : ''}>
        <td>${escapeHtml(log.id)}</td>
        <td>${escapeHtml(log.uid)}</td>
        <td>${escapeHtml(name || '未登録')}</td>
        <td>${escapeHtml(log.action)}</td>
        <td>${escapeHtml(log.created_at)}</td>
      </tr>`;
    })
    .join('');
}
// CSVエクスポート
document.getElementById('csv-export').addEventListener('click', () => {
  window.open('/api/logs.csv', '_blank');
});

// 月次サマリー
document.getElementById('monthly-export').addEventListener('click', async () => {
  const ym = prompt('集計する年月 (例: 2026-04)');
  if (!/^\d{4}-\d{2}$/.test(ym)) {
    setStatus('YYYY-MM形式で入力してください');
    return;
  }
  try {
    const res = await fetch(`/api/summary/monthly?ym=${encodeURIComponent(ym)}`);
    if (!res.ok) throw new Error('月次サマリー取得失敗');
    const { rows } = await res.json();
    renderMonthlySummary(rows, ym);
    setStatus(`${ym} の月次サマリーを表示しました`);
  } catch (e) {
    setStatus(e.message);
  }
});

function renderMonthlySummary(rows, ym) {
  const el = document.getElementById('monthly-summary');
  if (!rows || !rows.length) {
    el.innerHTML = `<p>${ym} のデータはありません。</p>`;
    return;
  }
  let html = `<table><thead><tr><th>UID</th><th>名前</th><th>日付</th><th>IN</th><th>OUT</th><th>最終打刻</th></tr></thead><tbody>`;
  for (const r of rows) {
    html += `<tr${!r.name ? ' class="unregistered"' : ''}>
      <td>${escapeHtml(r.uid)}</td>
      <td>${escapeHtml(r.name || '未登録')}</td>
      <td>${escapeHtml(r.date)}</td>
      <td>${escapeHtml(r.in_count)}</td>
      <td>${escapeHtml(r.out_count)}</td>
      <td>${escapeHtml(r.last_tap_at)}</td>
    </tr>`;
  }
  html += '</tbody></table>';
  el.innerHTML = html;
}

async function loadLogs() {
  const response = await fetch('/api/logs?limit=50');
  if (!response.ok) {
    throw new Error('ログの取得に失敗しました');
  }
  const logs = await response.json();
  renderLogs(logs);
}

userForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(userForm);
  const uid = String(formData.get('uid') || '').trim();
  const name = String(formData.get('name') || '').trim();

  try {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid, name }),
    });

    if (!response.ok) {
      throw new Error('社員登録に失敗しました');
    }

    setStatus(`社員登録を更新しました: ${name} (${uid})`);
    userForm.reset();
    await loadLogs();
  } catch (error) {
    setStatus(error.message);
  }
});

tapForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(tapForm);
  const uid = String(formData.get('uid') || '').trim();

  try {
    const response = await fetch('/api/tap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        const body = await response.json();
        throw new Error(`連続打刻を防止しました（${body.guardSeconds}秒待って再試行）`);
      }
      throw new Error('打刻に失敗しました');
    }

    const result = await response.json();
    tapResultEl.textContent = `打刻成功: ${result.uid} -> ${result.action}`;
    setStatus('打刻を記録しました');
    tapForm.reset();
    await loadLogs();
  } catch (error) {
    setStatus(error.message);
  }
});

reloadBtn.addEventListener('click', async () => {
  try {
    await loadLogs();
    setStatus('ログを更新しました');
  } catch (error) {
    setStatus(error.message);
  }
});

loadLogs()
  .then(() => setStatus('準備完了'))
  .catch((error) => setStatus(error.message));
