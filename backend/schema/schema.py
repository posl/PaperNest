from pydantic import BaseModel, Field
from typing import Optional, List

# 論文情報スキーマ
class PaperSchema(BaseModel):
    paper_id: str
    title: str
    authors: List[str]
    year: Optional[int] = None
    conference: Optional[str] = None
    bibtex: Optional[str]
    citations: Optional[int]
    core_rank: Optional[str]
    pdf_url: str  # ← 保存されたPDFファイルのURL
    category: Optional[str] = None  # オプションで研究テーマとの関連
    summary: Optional[str]

    class Config:
        from_attributes = True


# 論文アップロード成功時のレスポンススキーマ
class UploadPDFResponseSchema(BaseModel):
    success: bool
    message: str
    pdf_url: str  # 保存されたPDFのURL

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
    lang: str = Field(description="ユーザが使用した言語(ja または en)")

# ベクトル検索の応答用スキーマ
class VectorSearchResponseSchema(BaseModel):
    paper_id: str
    pdf_url: str
    similarity: float = Field(description="類似度スコア")
