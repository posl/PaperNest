# 🎯 ハッカソン（2025年・修士学生）リポジトリ

このリポジトリは、2025年5月に開催されたハッカソンのリポジトリです。

## 🚀 セットアップ手順（フロントエンド）

### Step 1: パッケージのインストール

```bash
npm install
```

## Step2: 開発サーバーの起動
```bash
npm run dev
```

## 🚀 セットアップ手順（バックエンド）
### Step1: uvでPython環境を制作
```bash
uv sync
```

### Step2: 仮想環境内に入り，ディレクトリ移動
```bash
source .venv/bin/activate
```
```bash
cd rag
```

### Step3: サーバーを起動
```bash
python3 -m uvicorn get_pdf:app --reload
```


## APIのテスト
別ターミナルで以下を実行．
PDFのUDL，タイトル，要約が返ってくる．
```bash
curl -X POST "http://127.0.0.1:8000/upload" -F "file=@(PDFの絶対パス)"
```
