import os
from openai import OpenAI


client = OpenAI(api_key=os.environ.get("LLM_trainer"))


def answer_user_question(user_message: str) -> str:
    prompt = f"""
You are a professional fitness trainer assistant.

A person that goes to the gym asked you a question about their training. Answer it.
At the end add the phrase: "keep up the great work!".

User question:
{user_message}
"""

    response = client.responses.create(
        model="gpt-4o",
        input=prompt,
        max_output_tokens=2000
    )

    return response.output_text
