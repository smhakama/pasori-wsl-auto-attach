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
      const name = log.name || '-';
      return `<tr>
        <td>${escapeHtml(log.id)}</td>
        <td>${escapeHtml(log.uid)}</td>
        <td>${escapeHtml(name)}</td>
        <td>${escapeHtml(log.action)}</td>
        <td>${escapeHtml(log.created_at)}</td>
      </tr>`;
    })
    .join('');
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
