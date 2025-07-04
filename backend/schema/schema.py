from typing import Any, List, Optional

from pydantic import BaseModel, Field


# 新規ユーザ登録リクエストスキーマ
class UserCreate(BaseModel):
    username: str
    elementary_school: str
    password: str


# 新規ユーザ登録レスポンススキーマ
class UserOut(BaseModel):
    id: int
    username: str
    elementary_school: str

    class Config:
        orm_mode = True


# ユーザ認証リフレッシュトークン付きトークンスキーマ
class TokenWithRefresh(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str


# リフレッシュリクエストスキーマ
class RefreshTokenRequest(BaseModel):
    refresh_token: str


# ユーザ認証トークンスキーマ
class Token(BaseModel):
    access_token: str
    token_type: str


# パスワード変更リクエストスキーマ
class PasswordChangeRequest(BaseModel):
    old_password: str
    new_password: str


# パスワード変更レスポンススキーマ
class PasswordChangeResponse(BaseModel):
    message: str


# パスワードリセット用認証リクエストスキーマ
class VerifyRequest(BaseModel):
    username: str
    elementary_school: str


# パスワードリセット用認証レスポンススキーマ
class VerifyResponse(BaseModel):
    message: str


# パスワードリセットリクエストスキーマ
class PasswordResetRequest(BaseModel):
    username: str
    new_password: str


# パスワードリセットレスポンススキーマ
class PasswordResetResponse(BaseModel):
    message: str


# ユーザ名変更リクエストスキーマ
class UsernameChangeRequest(BaseModel):
    new_username: str
    password: str


# ユーザ名変更レスポンススキーマ
class UsernameChangeResponse(BaseModel):
    message: str


# ユーザアカウント削除リクエストスキーマ
class AccountDeleteRequest(BaseModel):
    password: str


# ユーザアカウント削除レスポンススキーマ
class AccountDeleteResponse(BaseModel):
    message: str


# 論文情報スキーマ
class PaperSchema(BaseModel):
    paper_id: str
    title: Optional[str] = None
    authors: Optional[List[str]] = None
    year: Optional[int] = None
    conference: Optional[str] = None
    bibtex: Optional[str] = None
    citations: Optional[int]
    core_rank: Optional[str]
    pdf_url: str  # ← 保存されたPDFファイルのURL
    category: Optional[str] = None  # オプションで研究テーマとの関連
    summary: Optional[str] = None  # 論文の要約
    user_id: Optional[int] = None  # ユーザID

    class Config:
        from_attributes = True


# 論文アップロード成功時のレスポンススキーマ
class UploadPDFResponseSchema(BaseModel):
    success: bool
    message: str
    data: dict


# 質問受け付け用スキーマ
class PDFQuestionRequestSchema(BaseModel):
    paper_id: str
    question: str
    lang: str = Field(description="ユーザが使用した言語(ja または en)")


# 質問応答用スキーマ
class PDFQuestionResponseSchema(BaseModel):
    message: str


# ベクトル検索の質問受け付け用スキーマ
class VectorSearchRequestSchema(BaseModel):
    question: str
    language: str = Field(description="ユーザが使用した言語(ja または en)")
    category: str


# ベクトル検索の応答用スキーマ
class VectorSearchResponseSchema(BaseModel):
    paper_id: str
    title: Optional[str] = None
    authors: Optional[List[str]]
    year: Optional[int] = None
    conference: Optional[str] = None
    bibtex: Optional[str]
    citations: Optional[int]
    core_rank: Optional[str]
    pdf_url: str
    category: Optional[str] = None
    summary: Optional[str]
    llm_answer: str = Field(description="LLMの回答")
    similarity: float = Field(description="類似度スコア")
    chunk_text: str


# 論文への個別質問リクエストスキーマ
class PaperQuestionRequestSchema(BaseModel):
    question: str
    language: str = Field(description="ユーザが使用した言語(ja または en)")
    paper_id: str
    category: str


# 論文への個別質問レスポンススキーマ
class PaperQuestionResponseSchema(BaseModel):
    llm_answer: str = Field(description="LLMの回答")


# 論文情報更新リクエストスキーマ
class PaperUpdateRequestSchema(BaseModel):
    paper_id: str
    field: str
    value: Any


# 論文情報更新レスポンススキーマ
class PaperUpdateResponseSchema(BaseModel):
    message: str


# 論文情報削除レスポンススキーマ
class PaperDeleteResponseSchema(BaseModel):
    message: str


# 研究テーマ名更新リクエストスキーマ
class ResearchThemeUpdateRequestSchema(BaseModel):
    old_research_theme: str
    new_research_theme: str


# 研究テーマ名更新レスポンススキーマ
class ResearchThemeUpdateResponseSchema(BaseModel):
    message: str


# 研究テーマ削除レスポンススキーマ
class ResearchThemeDeleteResponseSchema(BaseModel):
    message: str
