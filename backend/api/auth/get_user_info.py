from fastapi import APIRouter, Depends
from backend.schema.schema import UserOut
from backend.models.models import User
from backend.utils.security import get_current_user

router = APIRouter()

@router.get("/get_user_info", response_model=UserOut)
def read_current_user(
    current_user: User = Depends(get_current_user)
):
    return current_user