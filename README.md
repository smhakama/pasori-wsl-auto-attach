# PaSoRi WSL Auto Attach

このリポジトリは、PaSoRi を WSL2 へ自動接続する仕組みを作るための作業用です。

最初のゴールは GitHub へ push するところまでです。

## 今回のゴール

- ローカルフォルダを Git リポジトリ化
- GitHub に新規リポジトリ作成
- 初回 push 完了

## 事前準備

- Git が使えること
- GitHub アカウントがあること
- このフォルダで作業していること

## 手順（最短）

1. GitHub で空のリポジトリを作成する
2. このフォルダで以下を実行する

git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOURNAME/pasori-wsl-auto-attach.git
git push -u origin main

3. GitHub 上で README が表示されれば完了

## つまずいたとき

- 認証エラーが出る場合: GitHub の PAT または Git Credential Manager を使用
- remote 設定ミスの場合: git remote -v で確認し、必要なら git remote remove origin

## 次のステップ

次は、勤怠管理アプリの作成に進みます。

予定する最小構成:

- API: Node.js + Express
- DB: SQLite
- 打刻: IC UID を受け取り IN/OUT を記録
- 画面: ログ一覧（まずはシンプル表示）

## フェーズ2開始手順（勤怠管理アプリ）

1. Node.js をインストール（推奨: 20 以上）
2. 以下を実行

cd api
npm install
npm start

3. 動作確認

- GET /health
- POST /api/tap
- GET /api/logs

詳細は api/README.md を参照してください。
