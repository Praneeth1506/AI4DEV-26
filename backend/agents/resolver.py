from openai import AsyncOpenAI
from prompts import RESOLVER_PROMPT
import os
from dotenv import load_dotenv

load_dotenv()
client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))


async def run_resolver(
    query: str, final_answer: str, critique: str, verification: str
) -> str:
    user_message = f"""Question: {query}

Solver's Final Answer:
{final_answer}

Critic's Assessment:
{critique}

Verifier's Report:
{verification}"""

    response = await client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": RESOLVER_PROMPT},
            {"role": "user", "content": user_message},
        ],
        temperature=0.4,
        max_tokens=800,
    )
    return response.choices[0].message.content
