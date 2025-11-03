import os
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from backend.database.database import get_db
from backend.utils.security import verify_password, get_current_user
from backend.schema.schema import AccountDeleteRequest, AccountDeleteResponse
from backend.models.models import User, Paper
from backend.config.config import EMBEDDINGS_MODEL, UPLOAD_DIR, VECTOR_STORE_DIR

router = APIRouter()

@router.delete("/delete/account", response_model=AccountDeleteResponse)
def delete_account(
    request: AccountDeleteRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # パスワード確認
    if not verify_password(request.password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="パスワードが違います．")

    embeddings = HuggingFaceEmbeddings(model_name=EMBEDDINGS_MODEL)
    vector_store = FAISS.load_local(VECTOR_STORE_DIR, embeddings, allow_dangerous_deserialization=True)

    # アップロードされたPDFファイルを削除
    user_papers = db.query(Paper).filter(Paper.user_id == current_user.id).all()
    for paper in user_papers:
        if paper.pdf_url:
            pdf_path = os.path.join(UPLOAD_DIR, os.path.basename(paper.pdf_url))
            if os.path.exists(pdf_path):
                try:
                    os.remove(pdf_path)
                    # print(f"削除しました: {pdf_path}")
                    # ベクトルデータベースから削除
                    if paper.chunk_count is None:
                        continue
                    matching_ids = [f"{paper.paper_id}_{i}" for i in range(paper.chunk_count)]
                    try:
                        vector_store.delete(matching_ids)
                    except Exception as e:
                        raise HTTPException(
                            status_code=500,
                            detail=f"ベクトルデータベースの削除中にエラーが発生しました（paper_id: {paper.paper_id}）: {e}"
                        )
                except Exception as e:
                    print(f"削除失敗: {pdf_path}, 理由: {e}")

    # ユーザー削除（cascade によりDB上の論文も消える）
    db.delete(current_user)
    db.commit()
    vector_store.save_local(VECTOR_STORE_DIR)

    return AccountDeleteResponse(message="アカウントが削除されました．")
