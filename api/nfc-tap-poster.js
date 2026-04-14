// PaSoRi (nfc-pcsc) → 勤怠API /api/tap 連携スクリプト
const { NFC } = require('nfc-pcsc');
const fetch = require('node-fetch');

const API_URL = process.env.API_URL || 'http://localhost:3000/api/tap';
const GUARD_SECONDS = Number(process.env.TAP_GUARD_SECONDS || '3');

const nfc = new NFC();

console.log('NFCリーダー待機中...');

nfc.on('reader', reader => {
  console.log(`リーダー検出: ${reader.name}`);

  reader.on('card', async card => {
    const uid = card.uid;
    console.log(`[${new Date().toISOString()}] カード検出: ${uid}`);
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid }),
      });
      if (res.status === 429) {
        const body = await res.json();
        console.log(`⚠️ 連続打刻ガード: ${body.guardSeconds}秒待機`);
        return;
      }
      if (!res.ok) {
        console.error('APIエラー:', await res.text());
        return;
      }
      const result = await res.json();
      console.log(`✅ 打刻: ${result.uid} → ${result.action}`);
    } catch (err) {
      console.error('通信エラー:', err.message);
    }
  });

  reader.on('error', err => {
    console.error('リーダーエラー:', err.message);
  });

  reader.on('end', () => {
    console.log('リーダー切断');
  });
});

nfc.on('error', err => {
  console.error('NFCエラー:', err.message);
});
