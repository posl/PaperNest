from fastapi import APIRouter, HTTPException, status, Depends
from jose import JWTError, jwt
from backend.models.models import User
from backend.database.database import get_db
from backend.utils.security import create_access_token, SECRET_KEY, ALGORITHM
from backend.schema.schema import Token, RefreshTokenRequest
from sqlalchemy.orm import Session

router = APIRouter()

@router.post("/refresh", response_model=Token)
def refresh_token(
    request: RefreshTokenRequest,
    db: Session = Depends(get_db)
):
    try:
        payload = jwt.decode(request.refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="不正なリフレッシュトークン")
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="リフレッシュトークンが無効です．")

    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="ユーザーが存在しません．")

    new_access_token = create_access_token(data={"sub": user.username})
    return Token(access_token=new_access_token, token_type="bearer")