import os

from dotenv import load_dotenv
from fastapi import APIRouter, Depends
from groq import Groq
from langchain.indexes.vectorstore import VectorStoreIndexWrapper
from langchain_community.vectorstores import FAISS
from langchain_groq import ChatGroq
from langchain_huggingface.embeddings import HuggingFaceEmbeddings

from backend.config import CHAT_MODEL, EMBEDDINGS_MODEL, VECTOR_STORE_DIR
from backend.database.database import SessionLocal
from backend.models.models import Paper, User
from backend.schema.schema import VectorSearchRequestSchema, VectorSearchResponseSchema
from backend.utils.security import get_current_user

router = APIRouter()  # インスタンス作成

load_dotenv()
groq_api_key = os.environ["GROQ_API_KEY"]
llm = ChatGroq(
    groq_api_key=groq_api_key,
    model_name=CHAT_MODEL,
)

embeddings = HuggingFaceEmbeddings(model_name=EMBEDDINGS_MODEL)
if VECTOR_STORE_DIR.exists():
    vector_store = FAISS.load_local(
        VECTOR_STORE_DIR,
        embeddings,
        allow_dangerous_deserialization=True,
    )


def ask_llm(
    query: str, vectorstore: FAISS, llm: ChatGroq, k: int, user_id: int, category: str
):
    vectorstoreindex = VectorStoreIndexWrapper(vectorstore=vectorstore)
    # LLMに質問を投げ，回答を生成
    answer = vectorstoreindex.query(query, llm)
    print(f"Answer: {answer}")

    results = []
    paper_ids = set()
    db = SessionLocal()
    # LLMの回答を分割し，分割されたそれぞれの文に対してベクトル検索
    for sentence in answer.split("\n"):
        if len(results) >= k:
            break
        filter = {
            "user_id": user_id,
            "category": category,
        }
        for res, score in vectorstore.similarity_search_with_score(
            sentence, k=k, filter=filter
        ):
            if len(results) >= k:
                break
            paper_id = res.metadata["source"]
            # paper_idが重複しないようにする
            if paper_id in paper_ids:
                continue
            paper_ids.add(paper_id)
            paper = db.query(Paper).filter(Paper.paper_id == paper_id).first()
            # 論文が存在する場合は，情報を返す
            if paper:
                results.append(
                    VectorSearchResponseSchema(
                        paper_id=paper.paper_id,
                        title=paper.title,
                        authors=paper.authors,
                        year=paper.year,
                        conference=paper.conference,
                        bibtex=paper.bibtex,
                        citations=paper.citations,
                        core_rank=paper.core_rank,
                        pdf_url=paper.pdf_url,
                        category=paper.category,
                        summary=paper.summary,
                        llm_answer=answer,
                        similarity=score,
                        chunk_text=res.page_content,
                    )
                )
            else:
                print(f"Paper with ID {paper_id} not found in the database.")

    db.close()
    return results


# PDF検索質問を受け取り，類似したPDFを返す
@router.post("/search", response_model=list[VectorSearchResponseSchema])
async def vector_search(
    query: VectorSearchRequestSchema, current_user: User = Depends(get_current_user)
):
    user_id = current_user.id
    question = query.question
    language = query.language
    category = query.category

    # 質問が英語以外の言語の場合，質問を英語翻訳して回答させる
    if language != "en":
        client = Groq(api_key=groq_api_key)
        system_prompt = "You are an excellent translator."
        user_prompt = f"Please translate the following text into English. However, please include only the translation results in your output.\n{question}"
        chat_completion = client.chat.completions.create(
            model=CHAT_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
        )
        print(f"Original question: {question}")
        question = chat_completion.choices[0].message.content
        print(f"Translated question: {question}")

    return ask_llm(
        query=question,
        vectorstore=vector_store,
        llm=llm,
        k=5,
        user_id=user_id,
        category=category,
    )
