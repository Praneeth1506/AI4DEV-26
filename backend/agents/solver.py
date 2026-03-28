from openai import AsyncOpenAI
from prompts import SOLVER_PROMPT
import os
from dotenv import load_dotenv

load_dotenv()
client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))


async def run_solver(query: str, previous_critique: str = "") -> str:
    user_message = f"Question: {query}"
    if previous_critique:
        user_message += f"\n\nPrevious critique to address:\n{previous_critique}"

    response = await client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": SOLVER_PROMPT},
            {"role": "user", "content": user_message},
        ],
        temperature=0.7,
        max_tokens=800,
    )
    return response.choices[0].message.content
