import re

from fastapi import APIRouter, Depends, HTTPException
from groq import Groq
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_community.vectorstores import FAISS
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables.base import RunnableBinding
from langchain_core.vectorstores.base import VectorStoreRetriever
from langchain_groq import ChatGroq

from backend.config.config import CHAT_MODEL, GROQ_API_KEY
from backend.database.database import SessionLocal
from backend.models.models import Paper, User
from backend.schema.schema import (
    PaperQuestionRequestSchema,
    PaperQuestionResponseSchema,
)
from backend.utils.security import get_current_user
from backend.utils.translate import translate
from backend.utils.vector_store import get_vector_store

router = APIRouter()  # インスタンス作成


# embeddings = HuggingFaceEmbeddings(model_name=EMBEDDINGS_MODEL)
# if VECTOR_STORE_DIR.exists():
#     vector_store = FAISS.load_local(
#         VECTOR_STORE_DIR,
#         embeddings,
#         allow_dangerous_deserialization=True,
#     )
# else:
#     raise FileNotFoundError(
#         f"Vector store directory {VECTOR_STORE_DIR} does not exist. Please ensure the vector store isinitialized."
#     )


# 英数字記号のみの文字列かどうかをチェック
def is_alnum_symbol(s):
    return re.fullmatch(r"[!-~]+", s) is not None


# クエリの翻訳
def translate_query(question: str) -> str:
    client = Groq(api_key=GROQ_API_KEY)
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


# RAGチェーンを作成
def create_rag_chain(
    retriever: VectorStoreRetriever, chat: ChatGroq, prompt: ChatPromptTemplate
) -> RunnableBinding:
    question_answer_chain = create_stuff_documents_chain(chat, prompt)
    rag_chain = create_retrieval_chain(retriever, question_answer_chain)
    return rag_chain


# 論文に関する質問への回答を生成
def generate_answer(rag_chain: RunnableBinding, question: str) -> str:
    response = rag_chain.invoke({"input": question})
    return response["answer"]


# RAGチェーンによる回答を生成
def get_rag_answer(
    vector_store: FAISS, question: str, paper_id: str, user_id: int, category: str
) -> str:
    groq_chat = ChatGroq(
        groq_api_key=GROQ_API_KEY,
        model_name=CHAT_MODEL,
    )
    system_prompt = "You are a helpful assistant. Please respond based on the content of the paper PDF.\n\n{context}"
    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", system_prompt),
            ("human", "{input}"),
        ]
    )

    # ユーザーIDとカテゴリーでフィルタリング
    filter = {
        "paper_id": paper_id,
        "user_id": user_id,
        "category": category,
    }
    retriever = vector_store.as_retriever(search_kwargs={"k": 6, "filter": filter})
    rag_chain = create_rag_chain(retriever, groq_chat, prompt)
    answer = generate_answer(rag_chain, question)
    return answer


# 論文への個別質問API
@router.post("/query/{paper_id}", response_model=PaperQuestionResponseSchema)
async def upload_pdf(
    query: PaperQuestionRequestSchema,
    current_user: User = Depends(get_current_user),
):
    question = query.question
    paper_id = query.paper_id
    category = query.category
    user_id = current_user.id

    # 質問が英語以外の言語の場合，質問を英語翻訳して回答させる
    if not is_alnum_symbol(question):
        question = translate(question, "en")

    # ベクトルストアを取得
    vector_store = get_vector_store()

    # 論文タイトルをデータベースから取得し，クエリに追加
    db = SessionLocal()
    try:
        paper = db.query(Paper).filter(Paper.paper_id == paper_id).first()
        if paper is None:
            db.close()
            raise HTTPException(
                status_code=404,
                detail=f"指定された論文{paper_id}は見つかりませんでした．",
            )
        question = f"{question}\n\n{paper.title}"
    except Exception as e:
        db.close()
        raise HTTPException(
            status_code=500,
            detail=f"データベースからの取得中にエラーが発生しました: {e}",
        )
    db.close()

    # RAGチェーンを使用して回答を生成
    answer = get_rag_answer(vector_store, question, paper_id, user_id, category)
    if not answer:
        raise HTTPException(status_code=500, detail="回答の生成に失敗しました．")

    return PaperQuestionResponseSchema(
        llm_answer=answer,
    )
