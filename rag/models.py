from pydantic import BaseModel


# 論文アップロード成功時のレスポンススキーマ
class UploadPDFResponseSchema(BaseModel):
    success: bool
    message: str
    pdf_url: str  # 保存されたPDFのURL
