import json
import os
from openai import AsyncOpenAI
from dotenv import load_dotenv
from agents.tavily_search import search_all_claims

load_dotenv()
client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# NOTE: Verifier prompts live here, not in prompts.py
# The Verifier uses a 3-step pipeline with its own internal prompts:
# Step 1: CLAIM_EXTRACTION_PROMPT — extract verifiable claims
# Step 2: Tavily search — fetch real sources per claim
# Step 3: VERIFIER_LLM_PROMPT — classify claims against sources

# ── Prompt: extract factual claims ────────────────────────────────────────────
CLAIM_EXTRACTION_PROMPT = """You are a fact-checking assistant.
Your task: extract 3-5 specific, independently verifiable factual claims from the answer below.

Rules:
- Each claim must be a single, concrete statement (e.g. "RSA uses 2048-bit keys by default")
- Skip opinions, value judgements, and vague assertions
- If fewer than 3 concrete facts exist, extract what you can
- Return ONLY a JSON array of strings, nothing else

Example: ["Claim 1", "Claim 2", "Claim 3"]"""

# ── Prompt: verify claims against Tavily sources ─────────────────────────────
VERIFIER_LLM_PROMPT = """You are a fact-checker with access to real search results.

For each claim below you are given Tavily search results as evidence.
Your task: classify each claim as CONFIRMED, DISPUTED, or UNSUPPORTED.

Definitions:
- CONFIRMED: sources clearly support the claim
- DISPUTED: sources contradict the claim
- UNSUPPORTED: sources are irrelevant or absent — cannot verify either way

Trust score logic (start at 100):
- Subtract 30 for each DISPUTED claim
- Subtract 15 for each UNSUPPORTED claim
- Clamp final score between 0 and 100
- Use a PRECISE integer (e.g. 73, 84) — do NOT round to multiples of 5 or 10

Return ONLY valid JSON in this exact format — no markdown, no explanation:
{
  "claims": [
    {
      "claim": "...",
      "verdict": "CONFIRMED | DISPUTED | UNSUPPORTED",
      "reason": "one concise sentence citing the evidence",
      "sources": [{"title": "...", "url": "..."}]
    }
  ],
  "trust_score": <integer 0-100>
}"""


async def _extract_claims(query: str, answer: str) -> list[str]:
    """Step 1: Ask the LLM to extract verifiable factual claims."""
    response = await client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": CLAIM_EXTRACTION_PROMPT},
            {"role": "user", "content": f"Question: {query}\n\nAnswer:\n{answer}"},
        ],
        temperature=0.0,
        max_tokens=300,
    )
    raw = response.choices[0].message.content.strip()
    try:
        claims = json.loads(raw)
        if isinstance(claims, list):
            return [str(c) for c in claims]
    except (json.JSONDecodeError, ValueError):
        pass
    # Fallback: treat each non-empty line as a claim
    return [line.strip("- •").strip() for line in raw.splitlines() if line.strip()]


async def _verify_with_sources(
    query: str, answer: str, claim_results: list[dict]
) -> dict:
    """Step 3: Ask LLM to classify each claim against the Tavily sources."""
    claims_text = json.dumps(claim_results, indent=2)
    user_msg = (
        f"Original question: {query}\n\n"
        f"Answer being verified:\n{answer}\n\n"
        f"Claims and search results:\n{claims_text}"
    )
    response = await client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": VERIFIER_LLM_PROMPT},
            {"role": "user", "content": user_msg},
        ],
        temperature=0.1,
        max_tokens=1200,
    )
    raw = response.choices[0].message.content.strip()
    # Strip markdown code fences if present
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    try:
        return json.loads(raw)
    except (json.JSONDecodeError, ValueError):
        # Return a safe fallback so the pipeline never breaks
        return {"claims": [], "trust_score": 50, "parse_error": raw[:200]}


def _compute_trust_score(claims: list[dict]) -> int:
    """Recompute trust score from verdicts as a safety net."""
    score = 100
    for c in claims:
        verdict = c.get("verdict", "UNSUPPORTED").upper()
        if verdict == "DISPUTED":
            score -= 30
        elif verdict == "UNSUPPORTED":
            score -= 15
    return max(0, min(100, score))


async def run_verifier(query: str, answer: str) -> str:
    """
    Three-step Tavily-powered fact verification.
    Returns a JSON string matching the structured output schema.
    Signature unchanged — drop-in replacement for the old verifier.
    """
    # Step 1: Extract factual claims
    claims = await _extract_claims(query, answer)

    # Step 2: Tavily search for each claim (sync, fast)
    claim_results = await search_all_claims(claims)

    # Step 3: LLM classification against sources
    result = await _verify_with_sources(query, answer, claim_results)

    # Only fall back to computed score if LLM failed to provide one at all
    if "claims" in result and result.get("claims"):
        if result.get("trust_score") is None:
            result["trust_score"] = _compute_trust_score(result["claims"])

    return json.dumps(result, indent=2)

