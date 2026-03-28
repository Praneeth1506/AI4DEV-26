import re
from agents.solver import run_solver
from agents.critic import run_critic
from agents.verifier import run_verifier
from agents.resolver import run_resolver
from agents.gemini_challenger import run_gemini_challenger
from typing import AsyncGenerator


def _extract_verdict(text: str, prefix: str = "verdict") -> str:
    """
    Robustly extract verdict from agent output.
    Handles variations like:
      "Verdict: ACCEPT"
      "Independent verdict: REVISE"
      "verdict: accept"
    Returns "ACCEPT" or "REVISE". Defaults to "REVISE" if not found.
    """
    pattern = rf"{prefix}[:\s]+([\w]+)"
    match = re.search(pattern, text, re.IGNORECASE)
    if match:
        return match.group(1).upper()
    # Fallback: check if ACCEPT appears anywhere near the end
    last_200 = text[-200:].upper()
    if "ACCEPT" in last_200 and "REVISE" not in last_200:
        return "ACCEPT"
    return "REVISE"


async def run_debate(query: str) -> AsyncGenerator[dict, None]:
    MAX_ROUNDS = 2
    critique = ""
    gemini_feedback = ""
    answer = ""

    for round_num in range(1, MAX_ROUNDS + 1):

        # ── Step 1: Solver proposes or revises ──────────────────────────
        yield {"agent": "solver", "round": round_num, "status": "thinking"}
        try:
            answer = await run_solver(query, critique)
        except Exception as e:
            yield {"agent": "solver", "round": round_num, "status": "error", "content": str(e)}
            return
        yield {"agent": "solver", "round": round_num, "status": "done", "content": answer}

        # ── Step 2: Critic challenges (GPT-4o) ──────────────────────────
        yield {"agent": "critic", "round": round_num, "status": "thinking"}
        try:
            critique = await run_critic(query, answer, round_num)
        except Exception as e:
            yield {"agent": "critic", "round": round_num, "status": "error", "content": str(e)}
            return
        yield {"agent": "critic", "round": round_num, "status": "done", "content": critique}

        # ── Step 3: Gemini Challenger (independent second opinion) ───────
        yield {"agent": "gemini_challenger", "round": round_num, "status": "thinking"}
        gemini_feedback = await run_gemini_challenger(query, answer, critique, round_num)
        yield {"agent": "gemini_challenger", "round": round_num, "status": "done", "content": gemini_feedback}

        # ── Early exit: BOTH must ACCEPT ─────────────────────────────────
        critic_verdict = _extract_verdict(critique, prefix="verdict")
        gemini_verdict = _extract_verdict(gemini_feedback, prefix="independent verdict")

        if critic_verdict == "ACCEPT" and gemini_verdict == "ACCEPT":
            yield {
                "agent": "system",
                "round": round_num,
                "status": "consensus",
                "content": (
                    f"Both the Critic and Independent Challenger accepted "
                    f"the answer in Round {round_num}. Moving to verification."
                ),
            }
            break

        elif critic_verdict == "ACCEPT" and gemini_verdict == "REVISE":
            yield {
                "agent": "system",
                "round": round_num,
                "status": "partial_consensus",
                "content": (
                    "Critic accepted but Independent Challenger raised new concerns. "
                    "Solver will revise."
                ),
            }

        elif critic_verdict == "REVISE" and gemini_verdict == "ACCEPT":
            yield {
                "agent": "system",
                "round": round_num,
                "status": "partial_consensus",
                "content": (
                    "Independent Challenger accepted but Critic raised concerns. "
                    "Solver will revise."
                ),
            }

    # ── Step 4: Verifier (Tavily-powered fact check) ──────────────────────
    yield {"agent": "verifier", "round": 0, "status": "thinking"}
    try:
        verification = await run_verifier(query, answer)
    except Exception as e:
        yield {"agent": "verifier", "round": 0, "status": "error", "content": str(e)}
        return
    yield {"agent": "verifier", "round": 0, "status": "done", "content": verification}

    # ── Step 5: Resolver synthesizes final verdict ────────────────────────
    combined_critique = (
        f"Primary Critic feedback:\n{critique}\n\n"
        f"Independent Challenger feedback:\n{gemini_feedback}"
    )
    yield {"agent": "resolver", "round": 0, "status": "thinking"}
    try:
        final = await run_resolver(query, answer, combined_critique, verification)
    except Exception as e:
        yield {"agent": "resolver", "round": 0, "status": "error", "content": str(e)}
        return
    yield {"agent": "resolver", "round": 0, "status": "done", "content": final}

    yield {"agent": "system", "round": 0, "status": "complete", "content": "Debate complete."}

