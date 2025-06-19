import os
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from langchain_community.vectorstores import FAISS
from langchain_huggingface.embeddings import HuggingFaceEmbeddings
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
                    print(f"削除しました: {pdf_path}")
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
                except Exception as e:
                    print(f"削除失敗: {pdf_path}, 理由: {e}")

    # ユーザー削除（cascade によりDB上の論文も消える）
    db.delete(current_user)
    db.commit()
    vector_store.save_local(VECTOR_STORE_DIR)

    return AccountDeleteResponse(message="アカウントが削除されました．")
