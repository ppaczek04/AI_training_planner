from openai import OpenAI
import os


client = OpenAI(api_key=os.environ.get("LLM_trainer"))

user_input = input("What you want to ask about: ")


response = client.responses.create(
    model="gpt-4o",
    input= [
        {"role": "developer","content": "Say Orange every second sentence"},
        {"role": "user","content": 
        f'''
        {user_input}
        '''
        }
    ]
)

print(response.output_text)