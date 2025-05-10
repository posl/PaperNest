import uvicorn
from main import APP

app = APP


# PDF検索質問を受け取り，類似したPDFを返す
@app.get("/lists_from_llm")
async def get_pdflists_from_llm(query: str):
    """処理1"""
    return


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
