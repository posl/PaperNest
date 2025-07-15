import os

from fastapi import APIRouter, Depends, HTTPException
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
from sqlalchemy.orm import Session

from backend.config.config import EMBEDDINGS_MODEL, UPLOAD_DIR, VECTOR_STORE_DIR
from backend.database.database import get_db
from backend.models.models import Paper
from backend.schema.schema import PaperDeleteResponseSchema

router = APIRouter()


@router.delete("/papers/delete/{paper_id}", response_model=PaperDeleteResponseSchema)
def delete_paper(paper_id: str, db: Session = Depends(get_db)):
    paper = db.query(Paper).filter(Paper.paper_id == paper_id).first()

    if not paper:
        raise HTTPException(status_code=404, detail="指定された論文は見つかりませんでした．")

    embeddings = HuggingFaceEmbeddings(model_name=EMBEDDINGS_MODEL)
    vector_store = FAISS.load_local(VECTOR_STORE_DIR, embeddings, allow_dangerous_deserialization=True)

    # PDFファイル削除処理
    pdf_path = os.path.join(UPLOAD_DIR, f"{paper_id}.pdf")
    if os.path.exists(pdf_path):
        try:
            os.remove(pdf_path)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"PDFファイルの削除中にエラーが発生しました: {e}")

    # データベースから削除
    db.delete(paper)
    db.commit()

    # ベクトルデータベースから削除
    if paper.chunk_count is None:
        raise HTTPException(status_code=500, detail="チャンク数が記録されていません．")

    matching_ids = [f"{paper_id}_{i}" for i in range(paper.chunk_count)]
    try:
        vector_store.delete(matching_ids)
        vector_store.save_local(VECTOR_STORE_DIR)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ベクトルデータベースからの削除中にエラーが発生しました．: {e}")

    return PaperDeleteResponseSchema(message="論文の削除が完了しました．")
