import os
import uuid
from io import BytesIO
from pathlib import Path
from typing import Dict

import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.responses import StreamingResponse
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables.base import RunnableBinding
from langchain_core.vectorstores.base import VectorStoreRetriever
from langchain_groq import ChatGroq
from models import UploadPDFResponseSchema
from pypdf import PdfReader

app = FastAPI()  # インスタンス作成
TOP_DIR = Path(__file__).resolve().parent
UPLOAD_DIR = TOP_DIR / "upload"  # PDFを一時的に保存するディレクトリ
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
BASE_URL = "http://127.0.0.1:8000"  # 静的ファイルのURL

memory_storage: Dict[str, bytes] = {}  # PDFの保存場所

# Get Groq API key
load_dotenv()
groq_api_key = os.environ["GROQ_API_KEY"]
groq_chat = ChatGroq(
    groq_api_key=groq_api_key,
    model_name="llama3-70b-8192",
)

system_prompt = "You are a helpful assistant. Please respond based on the content of the paper PDF.\n\n{context}"

prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system_prompt),
        ("human", "{input}"),
    ]
)


# PDFファイルからテキストを抽出
def read_text_from_pdf(pdf_path):
    reader = PdfReader(pdf_path)
    print(reader.pages[0].extract_text())
    text = ""
    for page_num in range(len(reader.pages)):
        page = reader.pages[page_num]
        text += page.extract_text()
    return text


# PDFのテキストを分割
def split_pdf_text(pdf_text: str) -> list:
    # チャンク間でoverlappingさせながらテキストを分割
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=50,
    )
    # テキストを分割
    splited_text = text_splitter.split_text(pdf_text)
    return splited_text


# テキストを埋め込みベクトルに変換
def embedding_text(splited_text: list) -> FAISS:
    embeddings = HuggingFaceEmbeddings(
        model_name="oshizo/sbert-jsnli-luke-japanese-base-lite"
    )
    index = FAISS.from_texts(splited_text, embedding=embeddings)
    return index


# FaissのRetrieverを取得
def get_retriever(index: FAISS) -> VectorStoreRetriever:
    retriever = index.as_retriever(search_kwargs={"k": 6})
    return retriever


# RAGチェーンを作成
def create_rag_chain(
    retriever: VectorStoreRetriever, grog_chat: ChatGroq, prompt: ChatPromptTemplate
) -> RunnableBinding:
    question_answer_chain = create_stuff_documents_chain(groq_chat, prompt)
    rag_chain = create_retrieval_chain(retriever, question_answer_chain)
    return rag_chain


# 論文のタイトルを生成
def generate_title(rag_chain: RunnableBinding) -> str:
    user_input = "PDFの1ページ目から，論文のタイトルを取得してください．出力形式は，以下です．\nTitle: {title}"
    response = rag_chain.invoke({"input": user_input})
    return response["answer"]


# 論文の要約を生成
def generate_summary(rag_chain: RunnableBinding) -> str:
    user_input = "PDFの全ページを読んで，論文を要約してください．出力形式は，以下です．\nSummary: {summary}"
    response = rag_chain.invoke({"input": user_input})
    return response["answer"]


@app.get("/")
def read_root():
    return {"message": "Hello, FastAPI is running!"}

# get_pdf.py

def analyze_pdf_from_bytes(pdf_bytes: bytes) -> Dict[str, str]:
    pdf_id = str(uuid.uuid4())
    pdf_url = f"{BASE_URL}/pdf/{pdf_id}.pdf"
    memory_storage[pdf_id] = pdf_bytes

    copy_pdf_path = UPLOAD_DIR / f"{pdf_id}.pdf"
    with open(copy_pdf_path, "wb") as f:
        f.write(pdf_bytes)

    pdf_text = read_text_from_pdf(str(copy_pdf_path))
    splited_txt = split_pdf_text(pdf_text)
    index = embedding_text(splited_txt)
    retriever = get_retriever(index)
    rag_chain = create_rag_chain(retriever, groq_chat, prompt)
    title = generate_title(rag_chain).replace("Title: ", "")
    if any(phrase in title.lower() for phrase in ["unable to extract", "unable to find"]):
        title = None
    else:
        if "Based on the PDF content" in title or "Based on the provided PDF content" in title:
            if "However, I can suggest a possible title:" in title:
                title = title.split("However, I can suggest a possible title:")[-1].strip()
            else:
                title = None  # 適切な提案がなかった場合は None にする

    summary = generate_summary(rag_chain).replace("Summary: ", "")

    os.remove(copy_pdf_path)

    # To 植中君: 連携するなら，この辺？
    # 処理3: レスポンスを返す
    # return {"pdf_url": pdf_url, "title": title, "summary": summary}
    return UploadPDFResponseSchema(
        success=True,
        message="PDF uploaded successfully.",
        pdf_url=pdf_url,
    )

    # except Exception as e:
    #     return UploadPDFResponseSchema(
    #         success=False,
    #         message=f"An error occurred: {str(e)}",
    #         pdf_url=None,
    #     )

# PDFをアップロード
# FastAPIのエンドポイント
@app.post("/upload")
async def upload_pdf(
    file: UploadFile = File(...),
    category: str = Form(None),
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed.")
    pdf_bytes = await file.read()
    return analyze_pdf_from_bytes(pdf_bytes)


# PDFを開く
@app.get("/pdf/{pdf_id}.pdf")
async def get_pdf(pdf_id: str):
    pdf_bytes = memory_storage.get(pdf_id)
    # PDFが存在しない場合はエラーを返す
    if pdf_bytes is None:
        raise HTTPException(status_code=404, detail="PDF not found.")
    # PDFを返す
    return StreamingResponse(
        content=BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f"inline; filename={pdf_id}.pdf"},
    )


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
