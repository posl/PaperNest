from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database.database import get_db
from backend.utils.security import verify_password, get_current_user
from backend.schema.schema import UsernameChangeRequest, UsernameChangeResponse
from backend.models.models import User

router = APIRouter()

@router.put("/change/username", response_model=UsernameChangeResponse)
def change_username(
    request: UsernameChangeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # パスワード確認
    if not verify_password(request.password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="パスワードが違います．")

    # 新しいユーザ名が既に存在するか確認
    existing_user = db.query(User).filter(User.username == request.new_username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="そのユーザー名は既に使用されています．")

    # ユーザ名更新
    current_user.username = request.new_username
    db.commit()
    return UsernameChangeResponse(message="ユーザー名を変更しました．")