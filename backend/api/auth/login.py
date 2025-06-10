from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from backend.database.database import get_db
from backend.models.models import User
from backend.utils.security import verify_password, create_access_token, create_refresh_token
from backend.schema.schema import TokenWithRefresh

router = APIRouter()

@router.post("/login", response_model=TokenWithRefresh)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    # ユーザー名でユーザーを検索
    user = db.query(User).filter(User.username == form_data.username).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="ユーザ名またはパスワードが無効です．",
        )

    # パスワード検証
    if not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="ユーザ名またはパスワードが無効です．"
        )

    # アクセストークンの生成
    access_token = create_access_token(data={"sub": user.username})
    refresh_token = create_refresh_token(data={"sub": user.username})

    return TokenWithRefresh(access_token=access_token, refresh_token=refresh_token, token_type="bearer")