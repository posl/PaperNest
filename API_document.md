# API仕様書

## 概要
このドキュメントは，バックエンドAPIの使用方法と仕様を記述したものです．主にフロントエンド開発者向けです．

---

## 共通事項

- ベースURL: `http://localhost:8000`
- 認証: JWT（Bearerトークン）
  - 認証が必要なAPIには，`Authorization: Bearer <token>` をヘッダーに付与

---