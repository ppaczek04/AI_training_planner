from openai import OpenAI
import os


client = OpenAI(api_key=os.environ.get("LLM_trainer"))

"""
https://platform.openai.com/docs/api-reference/responses
"""

# --------------------------------------------------------------
# Basic text example with the Chat Completions API
# --------------------------------------------------------------

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {
            "role": "user",
            "content": "Write a one-sentence bedtime story about a dragon.",
        }
    ],
)

print(response.choices[0].message.content)


# --------------------------------------------------------------
# Basic text example with the Responses API
# --------------------------------------------------------------

response = client.responses.create(
    model="gpt-4o", input="Write a one-sentence bedtime story about a racecar."
)

print(response.output_text)