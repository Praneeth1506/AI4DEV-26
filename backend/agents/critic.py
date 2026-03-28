from openai import AsyncOpenAI
from prompts import CRITIC_PROMPT
import os
from dotenv import load_dotenv

load_dotenv()
client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))


async def run_critic(query: str, answer: str) -> str:
    response = await client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": CRITIC_PROMPT},
            {
                "role": "user",
                "content": f"Question: {query}\n\nProposed Answer:\n{answer}",
            },
        ],
        temperature=0.8,
        max_tokens=600,
    )
    return response.choices[0].message.content
