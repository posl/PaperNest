import os
import re

from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException
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
else:
    raise FileNotFoundError(
        f"Vector store directory {VECTOR_STORE_DIR} does not exist. Please ensure the vector store is initialized."
    )


# 英数字記号のみの文字列かどうかをチェック
def is_alnum_symbol(s):
    return re.fullmatch(r"[!-~]+", s) is not None


# クエリの翻訳
def translate_query(question: str) -> str:
    client = Groq(api_key=groq_api_key)
    system_prompt = "You are an excellent translator."
    user_prompt = f"Please translate the following text into English. However, please include only thetranslation in the output. Also, if the following text is already written in English, pleaseoutput it as is.\n\n{question}"
    chat_completion = client.chat.completions.create(
        model=CHAT_MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
    )
    print(f"Original question: {question}")
    new_question = chat_completion.choices[0].message.content
    print(f"Translated question: {new_question}")
    return new_question


# LLMに質問を投げ，回答を生成し，ベクトル検索を行う
def get_similary_papers(
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
        # ユーザーIDとカテゴリーでフィルタリング
        filter = {
            "user_id": user_id,
            "category": category,
        }
        for res, score in vectorstore.similarity_search_with_score(
            query=sentence, k=k, filter=filter
        ):
            if len(results) >= k:
                break
            paper_id = res.metadata["paper_id"]
            # paper_idが重複しないようにする
            if paper_id in paper_ids:
                continue
            paper_ids.add(paper_id)
            try:
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
                    print(f"Debug info: {paper.paper_id}, {paper.title}, {paper.pdf_url}")
                else:
                    raise HTTPException(
                        status_code=404, detail=f"論文{paper_id}が見つかりませんでした．"
                    )
            except Exception as e:
                raise HTTPException(
                    status_code=500, detail=f"データベースからの取得中にエラーが発生しました: {e}"
                )

    db.close()
    # print(f"Debug info: {debug}")
    return results


# PDF検索質問を受け取り，類似したPDFを返す
@router.post("/search", response_model=list[VectorSearchResponseSchema])
async def vector_search(
    query: VectorSearchRequestSchema,
    current_user: User = Depends(get_current_user),
):
    user_id = current_user.id
    question = query.question
    category = query.category

    # 質問が英語以外の言語の場合，質問を英語翻訳して回答させる
    if not is_alnum_symbol(question):
        question = translate_query(question)


    return get_similary_papers(
        query=question,
        vectorstore=vector_store,
        llm=llm,
        k=5,
        user_id=user_id,
        category=category,
    )
