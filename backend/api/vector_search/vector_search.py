from fastapi import APIRouter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS

from backend.database.database import SessionLocal
from backend.models.models import Paper
from backend.schema.schema import (
    VectorSearchRequestSchema,
    VectorSearchResponseSchema,
)

from backend.config import VECTOR_STORE_DIR

router = APIRouter()  # インスタンス作成


# PDF検索質問を受け取り，類似したPDFを返す
@router.post("/search", response_model=list[VectorSearchResponseSchema])
async def vector_search(query: VectorSearchRequestSchema):
    question = query.question
    vector_store = FAISS.load_local(
        VECTOR_STORE_DIR,
        HuggingFaceEmbeddings(model_name="sentence-transformers/all-mpnet-base-v2"),
        allow_dangerous_deserialization=True,
    )
    db = SessionLocal()

    # 質問と類似している論文を，5件返す
    # 違うPDFのチャンクが欲しい．
    results = vector_store.similarity_search_with_score(question, 6)
    response = []
    for res, score in results:
        paper_id = res.metadata["source"]
        chunk_text = res.page_content
        # paper_idが一致する論文を取得
        paper = db.query(Paper).filter(Paper.paper_id == paper_id).first()
        if paper:
            print(f"Paper ID: {paper.paper_id}, PDF URL: {paper.pdf_url}, Similarity: {score}")
            response.append(
                VectorSearchResponseSchema(
                    paper_id=paper.paper_id, pdf_url=paper.pdf_url, similarity=score, chunk_text=chunk_text
                )
            )
        else:
            print(f"Paper with ID {paper_id} not found in the database.")

    db.close()

    return response
