import os
import sys

# ディレクトリ設定
base_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(base_dir)
sys.path.append(os.path.join(base_dir, ".."))

from sqlalchemy.orm import Session
from database.database import SessionLocal, engine, Base
from models import Paper
from pydantic import BaseModel
import uuid

# 初回のみテーブル作成．場所はこのpythonファイルの2つ上
Base.metadata.create_all(bind=engine)

# レスポンススキーマ
class UploadPDFResponseSchema(BaseModel):
    success: bool
    message: str
    pdf_url: str

def register_paper(metadata: dict) -> UploadPDFResponseSchema:
    db: Session = SessionLocal()

    try:
        # title or pdf_url がなければスキップ
        if not metadata.get("pdf_url") or not metadata.get("title"):
            msg = "[WARN] title または pdf_url が見つかりません。登録をスキップします。"
            print(msg)
            return UploadPDFResponseSchema(
                success=False,
                message=msg,
                pdf_url=metadata.get("pdf_url", "")
            )

        paper_id = str(uuid.uuid4())

        paper = Paper(
            paper_id=paper_id,
            title=metadata.get("title"),
            authors=metadata.get("authors"),
            year=metadata.get("year"),
            conference=metadata.get("conference"),
            bibtex=metadata.get("bibtex"),
            citations=metadata.get("citations"),
            core_rank=metadata.get("core_rank"),
            pdf_url=metadata.get("pdf_url"),
            category=metadata.get("category"),
            summary=metadata.get("summary")
        )

        db.add(paper)
        db.commit()

        msg = f"[INFO] 論文 '{metadata.get('title')}' をデータベースに登録しました。"
        print(msg)
        return UploadPDFResponseSchema(
            success=True,
            message=msg,
            pdf_url=metadata["pdf_url"]
        )

    except Exception as e:
        db.rollback()
        err_msg = f"[ERROR] 登録中にエラーが発生しました: {e}"
        print(err_msg)
        return UploadPDFResponseSchema(
            success=False,
            message=err_msg,
            pdf_url=metadata.get("pdf_url", "")
        )

    finally:
        db.close()

if __name__ == "__main__":
    db_register_dir = os.path.abspath(os.path.join(base_dir, ".."))

    # 4_metadata_fetch_from_title を sys.path に追加
    metadata_dir = os.path.join(db_register_dir, "4_metadata_fetch_from_title")
    sys.path.append(metadata_dir)
    from metadata_fetcher import fetch_metadata
    import json

    title = "Using Gameplay Videos for Detecting Issues in Video Games"
    metadata = fetch_metadata(title)

    metadata["pdf_url"] = "http://example.com/paper.pdf"
    metadata["category"] = "ゲームバグ検出"
    metadata["summary"] = "この論文はゲームプレイ映像を用いてバグ検出を行う手法を提案しています。"

    response = register_paper(metadata)
    
    print(json.dumps(response.model_dump(), indent=2, ensure_ascii=False))