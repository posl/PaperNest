from db_register.database.database import Base
from pydantic import BaseModel
from sqlalchemy import JSON, Column, Integer, String


class Paper(Base):
    __tablename__ = "papers"

    paper_id = Column(String, primary_key=True)
    title = Column(String, nullable=False)
    authors = Column(JSON)  # Store as JSON array
    year = Column(Integer)
    conference = Column(String)
    bibtex = Column(String)
    citations = Column(Integer)
    core_rank = Column(String)
    pdf_url = Column(String, nullable=False)
    category = Column(String)
    summary = Column(String)


# 論文アップロード成功時のレスポンススキーマ
class UploadPDFResponseSchema(BaseModel):
    success: bool
    message: str
    pdf_url: str  # 保存されたPDFのURL
