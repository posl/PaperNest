import os

from dotenv import load_dotenv
from fastapi import APIRouter, Depends
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_community.vectorstores import FAISS
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables.base import RunnableBinding
from langchain_core.vectorstores.base import VectorStoreRetriever
from langchain_groq import ChatGroq
from langchain_huggingface.embeddings import HuggingFaceEmbeddings

from backend.config import CHAT_MODEL, EMBEDDINGS_MODEL, VECTOR_STORE_DIR
from backend.models.models import User
from backend.schema.schema import (
    PaperQuestionRequestSchema,
    PaperQuestionResponseSchema,
)
from backend.utils.security import get_current_user

router = APIRouter()  # インスタンス作成

# GroqのAPI keyを取得
load_dotenv()
groq_api_key = os.environ["GROQ_API_KEY"]
groq_chat = ChatGroq(
    groq_api_key=groq_api_key,
    model_name=CHAT_MODEL,
)

system_prompt = "You are a helpful assistant. Please respond based on the content of the paper PDF.\n\n{context}"
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system_prompt),
        ("human", "{input}"),
    ]
)

embeddings = HuggingFaceEmbeddings(model_name=EMBEDDINGS_MODEL)


# FaissのRetrieverを取得
def get_retriever(index: FAISS) -> VectorStoreRetriever:
    retriever = index.as_retriever(search_kwargs={"k": 6})
    return retriever


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


# 論文への個別質問API
@router.post("/query/{paper_id}", response_model=PaperQuestionResponseSchema)
async def upload_pdf(
    query: PaperQuestionRequestSchema,
    current_user: User = Depends(get_current_user),
):
    question = query.question

    vector_store = FAISS.load_local(
        VECTOR_STORE_DIR, embeddings, allow_dangerous_deserialization=True
    )
    retriever = get_retriever(vector_store)
    rag_chain = create_rag_chain(retriever, groq_chat, prompt)
    answer = generate_answer(rag_chain, question)

    return PaperQuestionResponseSchema(
        llm_answer=answer,
    )
