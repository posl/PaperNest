from groq import Groq

from backend.config.config import CHAT_MODEL, GROQ_API_KEY

LANGUAGES = {"ja": "Japanese", "en": "English"}


# クエリの翻訳
def translate(question: str, language: str) -> str:
    client = Groq(api_key=GROQ_API_KEY)
    system_prompt = "You are an excellent translator."
    user_prompt = f"Please translate the following text into {LANGUAGES[language]}. However, please include only the translation in the output. Also, if the following text is already written in {LANGUAGES[language]}, pleaseoutput it as is.\n\n{question}"
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
