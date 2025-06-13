import os

from fastapi import APIRouter, Depends, HTTPException
from langchain_community.vectorstores import FAISS
from langchain_huggingface.embeddings import HuggingFaceEmbeddings
from sqlalchemy.orm import Session

from backend.config import EMBEDDINGS_MODEL, UPLOAD_DIR, VECTOR_STORE_DIR
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

            # ベクトルデータベースから削除
            matching_ids = [
                doc_id
                for doc_id, doc in vector_store.docstore._dict.items()
                if doc.metadata["paper_id"] == paper.paper_id
            ]
            if matching_ids:
                # for matching_id in matching_ids:
                vector_store.delete(matching_ids)
                print(
                    f"Len of vector store after deletion: {len(vector_store.docstore._dict)}"
                )
            else:
                raise HTTPException(
                    status_code=404,
                    detail="ベクトルデータベース内に該当論文が見つかりませんでした．",
                )

        db.commit()
        vector_store.save_local(VECTOR_STORE_DIR)

    return ResearchThemeDeleteResponseSchema(message="研究テーマの削除が完了しました．")
