# 🎯 PaperNestリポジトリ

このリポジトリは，論文管理用アプリPaperNestの開発用リポジトリです．

## セットアップ手順 (frontend + backend)

### 1. .envの作成
.devcontainer/Docker/backendに.envファイルを作成
keyはトイさんに聞いてください

.envファイルの形式
```bash
GROQ_API_KEY=your_api_key
SECRET_KEY=hoge
ALGORITHM=fuga
ACCESS_TOKEN_EXPIRE_MINUTES=hogehoge
REFRESH_TOKEN_EXPIRE_DAYS=fugafuga
```

### 2. コンテナの作成，機動

```bach 
cd .devcontainer
docker compose build --no-cache
docker compose up
```

### 3. Webにアクセス

backend -> http://localhost:8000/
frontend -> http://localhost:3000/



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
- このコマンドはPaperNest/で実行してください．
```bash
uvicorn backend.main:app --reload
```

### Step4: Swagger APIを起動
- 以下のURLにアクセスすると，Swagger APIでAPIのテストを実行できます．
```
http://127.0.0.1:8000/docs
```


---
<br>
<details>
<summary><strong>開発者向け情報</strong></summary>

## プロジェクト概要

## 技術スタック
- フロントエンド: React
- バックエンド: FastAPI

## 起動方法
