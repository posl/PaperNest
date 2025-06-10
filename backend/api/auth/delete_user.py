import os
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database.database import get_db
from backend.utils.security import verify_password, get_current_user
from backend.schema.schema import AccountDeleteRequest, AccountDeleteResponse
from backend.models.models import User, Paper
from backend.config import UPLOAD_DIR

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

    # アップロードされたPDFファイルを削除
    user_papers = db.query(Paper).filter(Paper.user_id == current_user.id).all()
    for paper in user_papers:
        if paper.pdf_url:
            pdf_path = os.path.join(UPLOAD_DIR, os.path.basename(paper.pdf_url))
            if os.path.exists(pdf_path):
                try:
                    os.remove(pdf_path)
                    print(f"削除しました: {pdf_path}")
                except Exception as e:
                    print(f"削除失敗: {pdf_path}, 理由: {e}")

    # ユーザー削除（cascade によりDB上の論文も消える）
    db.delete(current_user)
    db.commit()

    return AccountDeleteResponse(message="アカウントが削除されました．")