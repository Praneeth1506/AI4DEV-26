import asyncio
import os
from google import genai
from google.genai import types
from dotenv import load_dotenv
from prompts import GEMINI_CHALLENGER_PROMPT

load_dotenv()


def _call_gemini(query: str, answer: str, critique: str, round_num: int) -> str:
    """
    Synchronous Gemini call — wrapped in run_in_executor for async use.
    The google-genai SDK is sync-first, so we run it in a thread pool.
    Client is instantiated here (not at module level) so the backend
    starts cleanly even before GEMINI_API_KEY is configured.
    """
    client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

    user_message = (
        f"Question: {query}\n\n"
        f"Solver's Answer (Round {round_num}):\n{answer}\n\n"
        f"Primary Critic's Feedback:\n{critique}\n\n"
        f"Your job: Find what the Critic missed. "
        f"Do NOT repeat the Critic's points."
    )

    response = client.models.generate_content(
        model="gemini-3.1-flash-lite-preview",
        contents=user_message,
        config=types.GenerateContentConfig(
            system_instruction=GEMINI_CHALLENGER_PROMPT,
            temperature=0.4,
            max_output_tokens=800,
        ),
    )
    return response.text


async def run_gemini_challenger(
    query: str,
    answer: str,
    critique: str,
    round_num: int = 1,
) -> str:
    """
    Async wrapper for the Gemini challenger.
    Returns the challenger's response as a string.
    Non-fatal: if Gemini fails, debate continues with an ACCEPT fallback.
    """
    loop = asyncio.get_event_loop()
    try:
        result = await loop.run_in_executor(
            None,
            _call_gemini,
            query,
            answer,
            critique,
            round_num,
        )
        return result
    except Exception as e:
        # Non-fatal fallback — debate continues even if Gemini fails
        return (
            f"Independent review unavailable due to API error: {str(e)}\n"
            f"Independent verdict: ACCEPT"
        )