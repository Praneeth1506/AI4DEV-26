from openai import AsyncOpenAI
from prompts import VERIFIER_PROMPT
import os
from dotenv import load_dotenv

load_dotenv()
client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))


async def run_verifier(query: str, answer: str) -> str:
    response = await client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": VERIFIER_PROMPT},
            {
                "role": "user",
                "content": f"Question: {query}\n\nAnswer to verify:\n{answer}",
            },
        ],
        temperature=0.3,
        max_tokens=500,
    )
    return response.choices[0].message.content
