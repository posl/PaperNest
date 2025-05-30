from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database.database import get_db
from backend.utils.security import hash_password, get_current_user
from backend.schema.schema import PasswordResetRequest, PasswordResetResponse
from backend.models.models import User

router = APIRouter()

@router.put("/reset/password", response_model=PasswordResetResponse)
def reset_password(
    request: PasswordResetRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # current_userはJWTから取得される
    if current_user.elementary_school.strip().lower() != request.elementary_school.strip().lower():
        raise HTTPException(status_code=400, detail="秘密の質問の答えが一致しません．")

    # パスワードの更新
    current_user.hashed_password = hash_password(request.new_password)
    db.commit()

    return PasswordResetResponse(message="パスワードをリセットしました．")