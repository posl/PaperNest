# API仕様書

## 概要
  このドキュメントは，バックエンドAPIの使用方法と仕様を記述したものです．主にフロントエンド開発者向けです．

---

## 共通事項

  - ベースURL: `http://localhost:8000`
  - ユーザ認証: JWT（Bearerトークン）による認証
    - 認証が必要なAPIには，アクセストークンをヘッダに付与
    - 認証が必要なAPIで，アクセストークンが無効だと以下のレスポンスが返される．
      ステータスコード: 401
      {
        "detail": "Could not validate credentials"
      }
    - このときは，後述の「アクセストークン再発行」APIを叩いて新しいアクセストークンを発行し，再度叩きたかったAPIを叩く

---

## ユーザ管理系

### ユーザ登録

  - エンドポイント: POST /register/user
  - 説明: 新規ユーザの登録を行う
  - ユーザ認証: いらない

  - リクエスト
    - Content-Type: application/json
    {
      "username": "string",
      "elementary_school": "string",
      "password": "string"
    }
    - username: 登録したいユーザネーム
    - elementary_school: パスワードを忘れたときの質問用に登録する小学校の情報
    - password: 登録したいパスワード

  - レスポンス
    - 成功時
      {
        "id": int,
        "username": "string",
        "elementary_school": "string"
      }
      - id: 発行されたユーザID
      - username: 登録されたユーザネーム
      - elementary_school: 小学校情報

      - 成功時はログイン画面に移る

    - 失敗時（ユーザネームがすでに使われているとき）
      ステータスコード: 400
      {
        "detail": "そのユーザネームはすでに使用されています．"
      }
      - エラー発生時はもう一度登録データを入力させ，再び本APIを叩く

### ログイン
  - エンドポイント: POST /login
  - 説明: アカウントへのログインを行う
  - ユーザ認証: いらない

  - リクエスト
    - Content-Type: application/x-www-form-urlencoded
    - パラメータ
      - "username": "string"
      - "password": "string"
    - username: ログインするユーザネーム
    - password: パスワード

  - レスポンス
    - 成功時
      {
        "access_token": "string",
        "refresh_token": "string",
        "token_type": "string"
      }
      - access_token: アクセストークン．ユーザ認証が必要なAPIを叩くときはこれをヘッダに付与する
      - refresh_token: リフレッシュトークン．アクセストークンは30分で失効する．新しいアクセストークンの発行に必要
      - token_type: トークンタイプ．常に"bearer"が返される．使わないかも

      - 成功時は論文一覧画面に移る

    - 失敗時（ユーザネームまたはパスワードが違うとき）
      ステータスコード: 401
      {
        "detail": "ユーザ名またはパスワードが無効です．"
      }
      - エラー発生時はもう一度データを入力させ，再び本APIを叩く

### アクセストークン再発行

  - エンドポイント: POST /refresh
  - 説明: リフレッシュトークンを使用して新しいアクセストークンを発行する．他のAPIを叩いたときに401エラーが出た際に叩く
  - ユーザ認証: いらない

  - リクエスト
    - Content-Type: application/json
    {
      "refresh_token": "string",
    }
    - refresh_token: ログイン時に発行されたリフレッシュトークン

  - レスポンス
    - 成功時
      {
        "access_token": "string",
        "token_type": "string"
      }
      - access_token: 新しく発行されたアクセストークン
      - token_type: トークンタイプ．常に"bearer"が返される．使わないかも

      - 成功時は新しいアクセストークンを使用して再度叩きたかったAPIを叩く

    - 失敗時（トークンをデコードしてusernameを取り出すのに失敗したとき）
      ステータスコード: 401
      {
        "detail": "不正なリフレッシュトークン"
      }
      - エラー発生時はログイン画面に戻す

    - 失敗時（デコード時に例外が発生したとき）
      ステータスコード: 401
      {
        "detail": "リフレッシュトークンが無効です．"
      }
      - エラー発生時はログイン画面に戻す

    - 失敗時（トークンから取り出したusernameに対応するユーザが存在しないとき）
      ステータスコード: 401
      {
        "detail": "ユーザーが存在しません．"
      }
      - エラー発生時はログイン画面に戻す

### ログイン中のユーザの情報取得（いらないかも）

  - エンドポイント: GET /get_user_info
  - 説明: ログイン中のユーザの情報を取得する
  - ユーザ認証: いる

  - リクエスト
    ボディなし

  - レスポンス
    - 成功時
      {
        "id": 0,
        "username": "string",
        "elementary_school": "string"
      }
      - id: ユーザID
      - username: ユーザネーム
      - elementary_school: 小学校情報

### パスワード変更

  - エンドポイント: PUT /change/password
  - 説明: パスワードを変更する
  - ユーザ認証: いる

  - リクエスト
    - Content-Type: application/json
      {
        "old_password": "string",
        "new_password": "string"
      }
    - old_password: 登録済みのパスワード
    - new_password: 変更先のパスワード

  - レスポンス
    - 成功時
      {
        "message": "パスワードを変更しました．"
      }
      - 成功時は論文一覧画面に移る

    - 失敗時（パスワードが違うとき）
      ステータスコード: 400
      {
        "detail": "パスワードが違います．"
      }
      - エラー発生時は再度パスワードを入力させ，本APIを再度叩く

### ユーザアカウント削除

  - エンドポイント: DELETE /delete/account
  - 説明: ユーザアカウント削除
  - ユーザ認証: いる

  - リクエスト
    - Content-Type: application/json
      {
        "password": "string"
      }
    - password: パスワード

  - レスポンス
    - 成功時
      {
        "message": "アカウントが削除されました．"
      }
      - 成功時はログイン画面に移る

    - 失敗時（パスワードが違うとき）
      ステータスコード: 400
      {
        "detail": "パスワードが違います．"
      }
      - エラー発生時は再度パスワードを入力させ，本APIを再度叩く

### パスワードを忘れたときのパスワード再設定

  - エンドポイント: PUT /reset/password
  - 説明: パスワードを忘れたときのパスワード再設定
  - ユーザ認証: いらない

  - リクエスト
    - Content-Type: application/json
      {
        "username": "string",
        "elementary_school": "string",
        "new_password": "string"
      }
    - username: ユーザネーム
    - elementary_school: 新規ユーザ登録時に登録した小学校
    - new_password: 再設定先のパスワード

  - レスポンス
    - 成功時
      {
        "message": "パスワードをリセットしました．"
      }
      - 成功時はログイン画面に移る

    - 失敗時（入力したユーザネームが存在しないとき）
      ステータスコード: 404
      {
        "detail": "ユーザーが見つかりません．"
      }
      - エラー発生時は再度データを入力させ，本APIを再度叩く

    - 失敗時（小学校が違うとき）
      ステータスコード: 400
      {
        "detail": "秘密の質問の答えが一致しません．"
      }
      - エラー発生時は再度データを入力させ，本APIを再度叩く

### ユーザネーム変更

  - エンドポイント: PUT /change/username
  - 説明: ユーザネーム変更
  - ユーザ認証: いる

  - リクエスト
    - Content-Type: application/json
      {
        "new_username": "string",
        "password": "string"
      }
    - new_username: 変更先のユーザネーム
    - password: パスワード

  - レスポンス
    - 成功時
      {
        "message": "ユーザー名を変更しました．"
      }
      - 成功時は論文一覧画面に移る

    - 失敗時（パスワードが違うとき）
      ステータスコード: 400
      {
        "detail": "パスワードが違います．"
      }
      - エラー発生時は再度データを入力させ，本APIを再度叩く

    - 失敗時（ユーザネームがすでに使われているとき）
      ステータスコード: 400
      {
        "detail": "そのユーザー名は既に使用されています．"
      }
      - エラー発生時は再度データを入力させ，本APIを再度叩く

## 論文系

### 論文アップロード

  - エンドポイント: POST /upload
  - 説明: 論文をデータベースに登録する
  - ユーザ認証: いる

  - リクエスト
    - Content-Type: multipart/form-data
    - パラメータ
      - "file": file
      - "category": "string"
    - file: アップロードするPDFファイル
    - category: 研究テーマ名

  - レスポンス
    - 成功時（例）
      {
        "success": bool,
        "message": "string",
        "data": {
          "paper_id": "string",
          "title": "string",
          "authors": [
            "string",
            "string",
            "string",
            "string",
            "string"
          ],
          "year": int,
          "conference": "string",
          "bibtex": "string",
          "citations": int,
          "core_rank": "string",
          "pdf_url": "string",
          "category": "string",
          "summary": "string",
          "user_id": int
        }
      }
      - success: 論文の登録が成功したかどうか
      - message: 
        - 成功時: "PDFの登録が完了しました．"
        - 失敗時（取得に失敗したメタデータがあるとき）
          - "string", "string"の取得に失敗しました．
        - 失敗時（データベースへの登録中にエラーが出たとき）
          - 登録中にエラーが発生しました．
      - data:
        - paper_id: 論文に付与されたID
        - title: 論文のタイトル
        - author: 論文の著者
        - year: 執筆年度
        - conference: 会議，論文誌
        - bibtex: 論文のbibtex
        - citations: 被引用数
        - core_rank: 会議，論文誌のコアランク
        - pdf_url: PDFに付与されたURL
        - category: 登録された研究テーマ名
        - summary: 論文の要約
        - user_id: 論文登録を行ったユーザのユーザID

      - 成功時は論文全件取得APIを叩く

    - 失敗時（PDF以外のファイルが入力されたとき）
      ステータスコード: 400
      {
        "detail": "Only PDF files are allowed."
      }
      - エラー発生時は論文一覧画面に戻る

    - 失敗時（PDFが空のとき）
      ステータスコード: 400
      {
        "detail": "PDFが空です．"
      }
      - エラー発生時は論文一覧画面に戻る

    - 失敗時（同じPDFが登録されたとき）
      ステータスコード: 409
      {
        "detail": "このPDFはすでに登録されています．"
      }
      - エラー発生時は論文一覧画面に戻る

### 論文全件取得

  - エンドポイント: GET /get_all_papers
  - 説明: ユーザが登録した全ての論文のメタデータを取得
  - ユーザ認証: いる

  - リクエスト
    ボディなし

  - レスポンス
    - 成功時
      [
        {
          "paper_id": "string",
          "title": "string",
          "authors": [
            "string",
            "string",
            "string",
            "string",
            "string"
          ],
          "year": int,
          "conference": "string",
          "bibtex": "string",
          "citations": int,
          "core_rank": "string",
          "pdf_url": "string",
          "category": "string",
          "summary": "string",
          "user_id": int
        }, 
                {
          "paper_id": "string",
          "title": "string",
          "authors": [
            "string",
            "string",
            "string"
          ],
          "year": int,
          "conference": "string",
          "bibtex": "string",
          "citations": int,
          "core_rank": "string",
          "pdf_url": "string",
          "category": "string",
          "summary": "string",
          "user_id": int
        }
      ]      
      - 成功時は論文一覧画面に移る

    - 失敗時（データベースからの取得中にエラーが発生したとき）
      ステータスコード: 500
      {
        "detail": "データの取得中にエラーが発生しました．"
      }
      - エラー発生時はログイン画面に戻す（？）

### 論文検索（🚨制作途中．ユーザ認証機能が未実装）

  - エンドポイント: POST /search
  - 説明: プロンプトを投げ，類似した論文を返す
  - ユーザ認証: いらない（将来的にはいる）

  - リクエスト
    - Content-Type: application/json
      {
        "question": "string",
        "lang": "string",
        🚨"category: "string"（将来的には実装）
      }
      - question: プロンプト
      - lang: 質問の言語
      - 🚨category: 研究テーマ名（将来的には実装）

  - レスポンス
    - 成功時
      [
        {
          "paper_id": "string",
          "title": "string",
          "authors": [
            "string",
            "string",
            "string",
            "string",
            "string"
          ],
          "year": int,
          "conference": "string",
          "bibtex": "string",
          "citations": int,
          "core_rank": "string",
          "pdf_url": "string",
          "category": "string",
          "summary": "string",
          "llm_answer": "string",
          "similarity": int,
          "chunk_text": "string"
        },
        {
          "paper_id": "string",
          "title": "string",
          "authors": [
            "string",
            "string",
            "string",
            "string",
            "string"
          ],
          "year": int,
          "conference": "string",
          "bibtex": "string",
          "citations": int,
          "core_rank": "string",
          "pdf_url": "string",
          "category": "string",
          "summary": "string",
          "llm_answer": "string",
          "similarity": int,
          "chunk_text": "string"
        }
      ]    
      - llm_answer: LLMの回答
      - similarity: 類似度を示す距離
      - chunk_text: 決め手となったチャンクテキスト

      - 成功時はヒットした論文一覧画面に移る

### 論文の登録データ変更

  - エンドポイント: PUT /papers/update
  - 説明: 登録した論文の登録データを変更する
  - ユーザ認証: いらない

  - リクエスト
    - Content-Type: application/json
      {
        "paper_id": "string",
        "field": "string",
        "value": "string"
      }
      - paper_id: 変更したい論文のpaper_id
      - field: 変更したいフィールド（author, bibtexなど）
      - value: 変更先の値

  - レスポンス
    - 成功時
      {
        "message": "データの更新が完了しました．"
      }
      - 成功時は論文全件取得APIを叩く

    - 失敗時（論文が見つからないとき）
      ステータスコード: 404
      {
        "detail": "論文が見つかりません．"
      }
      - エラー発生時は論文一覧画面に戻る

    - 失敗時（フィールドが見つからないとき）
      ステータスコード: 400
      {
        "detail": "フィールドが存在しません．"
      }
      - エラー発生時は論文一覧画面に戻る

### 論文の削除

  - エンドポイント: DELETE /papers/delete/{paper_id}
  - 説明: 登録した論文を削除する
  - ユーザ認証: いらない

  - リクエスト
    - パスパラメータ
      - paper_id: 削除したい論文のpaper_id

  - レスポンス
    - 成功時
      {
        "message": "論文の削除が完了しました．"
      }    
      - 成功時は論文全件取得APIを叩く

    - 失敗時（論文が見つからないとき）
      ステータスコード: 404
      {
        "detail": "指定された論文は見つかりませんでした．"
      }
      - エラー発生時は論文一覧画面に戻る

    - 失敗時（PDFファイルの削除中にエラーが発生したとき．）
      ステータスコード: 500
      {
        "detail": "PDFファイルの削除中にエラーが発生しました． {e}"
      }
      - エラー発生時は論文一覧画面に戻る

### 研究テーマ名の変更

  - エンドポイント: PUT /research_theme/update
  - 説明: 研究テーマ名を変更する
  - ユーザ認証: いる

  - リクエスト
    - Content-Type: application/json
      {
        "old_research_theme": "string",
        "new_research_theme": "string"
      }
      - old_research_theme: 変更元の研究テーマ名
      - new_research_theme: 変更元の研究テーマ名

  - レスポンス
    - 成功時
      {
        "message": "研究テーマ名の更新が完了しました．"
      }   
      - 成功時は論文全件取得APIを叩く

    - 失敗時（該当する研究テーマが見つからなかったとき）
      ステータスコード: 404
      {
        "detail": "該当する研究テーマが見つかりませんでした．"
      }
      - エラー発生時は論文一覧画面に戻る

### 研究テーマの削除

  - エンドポイント: DELETE /delete/{research_theme}
  - 説明: 研究テーマを削除する
  - ユーザ認証: いる

  - リクエスト
    - パスパラメータ
      - research_theme: 削除したい研究テーマ名

  - レスポンス
    - 成功時
      {
        "message": "研究テーマの削除が完了しました．"
      }    
      - 成功時は論文全件取得APIを叩く

    - 失敗時（PDFファイルの削除中にエラーが発生したとき．）
      ステータスコード: 500
      {
        "detail": "PDFファイルの削除中にエラーが発生しました（paper_id: {paper.paper_id}）: {e}"
      }
      - エラー発生時は論文一覧画面に戻る