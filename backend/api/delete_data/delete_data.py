import os

from fastapi import APIRouter, Depends, HTTPException
from langchain_community.vectorstores import FAISS
from langchain_huggingface.embeddings import HuggingFaceEmbeddings
from sqlalchemy.orm import Session

from backend.config import EMBEDDINGS_MODEL, UPLOAD_DIR, VECTOR_STORE_DIR
from backend.database.database import get_db
from backend.models.models import Paper
from backend.schema.schema import PaperDeleteResponseSchema

router = APIRouter()


@router.delete("/papers/delete/{paper_id}", response_model=PaperDeleteResponseSchema)
def delete_paper(paper_id: str, db: Session = Depends(get_db)):
    paper = db.query(Paper).filter(Paper.paper_id == paper_id).first()
    embeddings = HuggingFaceEmbeddings(model_name=EMBEDDINGS_MODEL)
    vector_store = FAISS.load_local(VECTOR_STORE_DIR, embeddings, allow_dangerous_deserialization=True)

    if not paper:
        raise HTTPException(status_code=404, detail="指定された論文は見つかりませんでした．")

    # PDFファイル削除処理
    pdf_path = os.path.join(UPLOAD_DIR, f"{paper_id}.pdf")
    if os.path.exists(pdf_path):
        try:
            os.remove(pdf_path)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"PDFファイルの削除中にエラーが発生しました: {e}")

    # データベースから削除
    db.delete(paper)
    db.commit()

    # ベクトルデータベースから削除
    matching_ids = [
        doc_id
        for doc_id, doc in vector_store.docstore._dict.items()
        if doc.metadata["paper_id"] == paper_id
    ]
    if matching_ids:
        # for matching_id in matching_ids:
        vector_store.delete(matching_ids)
        print(f"Len of vector store after deletion: {len(vector_store.docstore._dict)}")
        vector_store.save_local(VECTOR_STORE_DIR)
    else:
        raise HTTPException(status_code=404, detail="ベクトルデータベース内に該当論文が見つかりませんでした．",)

    return PaperDeleteResponseSchema(message="論文の削除が完了しました．")
