import asyncio
from agents.solver import run_solver
from agents.critic import run_critic
from agents.verifier import run_verifier
from agents.resolver import run_resolver
from typing import AsyncGenerator


async def run_debate(query: str) -> AsyncGenerator[dict, None]:
    MAX_ROUNDS = 3
    critique = ""
    answer = ""

    for round_num in range(1, MAX_ROUNDS + 1):
        # Step 1: Solver proposes or revises
        yield {"agent": "solver", "round": round_num, "status": "thinking"}
        try:
            answer = await run_solver(query, critique)
        except Exception as e:
            yield {"agent": "solver", "round": round_num, "status": "error", "content": str(e)}
            return
        yield {"agent": "solver", "round": round_num, "status": "done", "content": answer}

        # Step 2: Critic challenges
        yield {"agent": "critic", "round": round_num, "status": "thinking"}
        try:
            critique = await run_critic(query, answer)
        except Exception as e:
            yield {"agent": "critic", "round": round_num, "status": "error", "content": str(e)}
            return
        yield {"agent": "critic", "round": round_num, "status": "done", "content": critique}

        # Early exit if critic accepts
        if "VERDICT: ACCEPT" in critique.upper():
            yield {
                "agent": "system",
                "round": round_num,
                "status": "consensus",
                "content": "Critic accepted the answer. Moving to verification.",
            }
            break

    # Step 3: Verifier checks facts
    yield {"agent": "verifier", "round": 0, "status": "thinking"}
    try:
        verification = await run_verifier(query, answer)
    except Exception as e:
        yield {"agent": "verifier", "round": 0, "status": "error", "content": str(e)}
        return
    yield {"agent": "verifier", "round": 0, "status": "done", "content": verification}

    # Step 4: Resolver synthesizes final answer
    yield {"agent": "resolver", "round": 0, "status": "thinking"}
    try:
        final = await run_resolver(query, answer, critique, verification)
    except Exception as e:
        yield {"agent": "resolver", "round": 0, "status": "error", "content": str(e)}
        return
    yield {"agent": "resolver", "round": 0, "status": "done", "content": final}

    yield {"agent": "system", "round": 0, "status": "complete", "content": "Debate complete."}
