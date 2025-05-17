# 🎯 ハッカソン（2025年・修士学生）リポジトリ

このリポジトリは，2025年5月に開催されたハッカソンのリポジトリです．

## 🚀 セットアップ手順（フロントエンド）

### Step 1: パッケージのインストール

```bash
npm install
```

### Step2: 開発サーバーの起動
```bash
npm run dev
```

## 🚀 セットアップ手順（バックエンド）
### Step1: uvでPython環境を制作
```bash
uv sync
```

### Step2: 仮想環境のアクティベート
```bash
source .venv/bin/activate
```

### Step3: サーバーを起動
- このコマンドは2025-hackathon/で実行してください．
```bash
uvicorn backend.main:app --reload
```

### Step4: Swagger APIを起動
- 以下のURLにアクセスすると，Swagger APIでAPIのテストを実行できます．
```
http://127.0.0.1:8000/docs
```

## 論文の登録
- サーバーを起動したターミナルとは別のターミナルで以下を実行してください．
```bash
curl -X POST "http://127.0.0.1:8000/upload" -F "file=@/absolute/path/to/your/pdf" -F "category=research_category"
```
- 論文がデータベースに登録されます．
- 登録ができたかどうかのレスポンスが返ってきます．

## 論文の全件取得
- サーバーを起動したターミナルとは別のターミナルで以下を実行してください．
```bash
curl http://127.0.0.1:8000/get_all_papers
```
- 全ての論文の全てのメタデータが返ってきます．

## 質問と類似した論文の検索
- サーバーを起動したターミナルとは別のターミナルで以下を実行してください．(以下は英語での質問)
```bash
curl -X POST "http://127.0.0.1:8000/search" -H "Content-Type: application/json" -d '{"question": "(Please input your query)", "lang": "en"}'
```
- 質問と類似した論文のPAPER_ID，URLが返ってきます．
