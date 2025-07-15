import os
import time

from fastapi import APIRouter, Depends, HTTPException
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
from sqlalchemy.orm import Session

from backend.config.config import EMBEDDINGS_MODEL, UPLOAD_DIR, VECTOR_STORE_DIR
from backend.database.database import get_db
from backend.models.models import Paper, User
from backend.schema.schema import ResearchThemeDeleteResponseSchema
from backend.utils.security import get_current_user

router = APIRouter()


@router.delete(
    "/delete/{research_theme}",
    response_model=ResearchThemeDeleteResponseSchema,
)
def delete_papers_by_theme(
    research_theme: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    total_start = time.time()
    # 認証ユーザーに紐づいた指定テーマの論文だけを取得
    papers = (
        db.query(Paper).filter(Paper.category == research_theme, Paper.user_id == current_user.id).all()
    )
    embeddings = HuggingFaceEmbeddings(model_name=EMBEDDINGS_MODEL)
    vector_store = FAISS.load_local(VECTOR_STORE_DIR, embeddings, allow_dangerous_deserialization=True)

    if papers:
        for paper in papers:
            # PDFファイル削除処理
            pdf_path = os.path.join(UPLOAD_DIR, f"{paper.paper_id}.pdf")
            if os.path.exists(pdf_path):
                try:
                    os.remove(pdf_path)
                except Exception as e:
                    raise HTTPException(status_code=500, detail=f"PDFファイルの削除中にエラーが発生しました（paper_id: {paper.paper_id}）: {e}")

            # データベースから削除
            db.delete(paper)
            db.commit()

            # ベクトルデータベースから削除
            if paper.chunk_count is None:
                raise HTTPException(
                    status_code=500,
                    detail=f"チャンク数（chunk_count）が記録されていません（paper_id: {paper.paper_id}）．"
                )

            matching_ids = [f"{paper.paper_id}_{i}" for i in range(paper.chunk_count)]
            try:
                vector_store.delete(matching_ids)
            except Exception as e:
                raise HTTPException(
                    status_code=500,
                    detail=f"ベクトルデータベースの削除中にエラーが発生しました（paper_id: {paper.paper_id}）: {e}"
                )

        vector_store.save_local(VECTOR_STORE_DIR)

    total_end = time.time()
    print(f"全体の処理にかかった時間: {total_end - total_start}秒")
    return ResearchThemeDeleteResponseSchema(message="研究テーマの削除が完了しました．")
