from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database.database import get_db
from backend.utils.security import verify_password, get_current_user
from backend.schema.schema import AccountDeleteRequest, AccountDeleteResponse
from backend.models.models import User

router = APIRouter()

@router.delete("/delete/account", response_model=AccountDeleteResponse)
def delete_account(
    request: AccountDeleteRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # パスワード確認（オプション）
    if not verify_password(request.password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="パスワードが違います．")

    # 削除処理
    db.delete(current_user)
    db.commit()

    return AccountDeleteResponse(message="アカウントが削除されました．")