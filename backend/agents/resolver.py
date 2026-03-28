import json
import os
from openai import AsyncOpenAI
from prompts import RESOLVER_PROMPT
from dotenv import load_dotenv

load_dotenv()
client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def _format_verifier_input(verification: str) -> str:
    """
    If verification is structured JSON from the new Tavily-backed verifier,
    format it as a readable claim list for the Resolver prompt.
    Falls back to raw text for legacy string output.
    """
    try:
        data = json.loads(verification)
        if not isinstance(data.get("claims"), list):
            return verification

        lines = [f"Verifier Trust Score: {data.get('trust_score', 'N/A')}/100\n"]
        for c in data["claims"]:
            verdict = c.get("verdict", "UNSUPPORTED")
            claim = c.get("claim", "")
            reason = c.get("reason", "")
            sources = c.get("sources", [])
            source_urls = ", ".join(
                f"{s['title']} ({s['url']})"
                for s in sources if s.get("url")
            ) or "no sources"
            lines.append(
                f"• [{verdict}] {claim}\n"
                f"  Reason: {reason}\n"
                f"  Sources: {source_urls}"
            )
        return "\n".join(lines)
    except (json.JSONDecodeError, TypeError):
        return verification


async def run_resolver(
    query: str, answer: str, critique: str, verification: str
) -> str:
    verifier_section = _format_verifier_input(verification)

    user_message = f"""Question: {query}

Solver's Final Answer:
{answer}

Challenger Assessments (Critic + Independent Gemini Challenger):
{critique}

Verifier's Report (Tavily-sourced fact check):
{verifier_section}"""

    response = await client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": RESOLVER_PROMPT},
            {"role": "user", "content": user_message},
        ],
        temperature=0.3,
        max_tokens=1000,
    )
    return response.choices[0].message.content