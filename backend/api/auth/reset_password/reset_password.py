from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database.database import get_db
from backend.utils.security import hash_password
from backend.schema.schema import PasswordResetRequest, PasswordResetResponse
from backend.models.models import User

router = APIRouter()

@router.put("/reset/password", response_model=PasswordResetResponse)
def reset_password(
    request: PasswordResetRequest,
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.username == request.username).first()

    user.hashed_password = hash_password(request.new_password)
    db.commit()

    return PasswordResetResponse(message="パスワードをリセットしました．")