import asyncio
import os
from tavily import TavilyClient
from dotenv import load_dotenv

load_dotenv()
_client = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))

def search_claim(claim: str, max_results: int = 4) -> list[dict]:
    try:
        response = _client.search(
            query=claim,
            search_depth="advanced",
            max_results=max_results,
            include_domains=[
                "pubmed.ncbi.nlm.nih.gov",
                "nice.org.uk",
                "fda.gov",
                "drugs.com",
                "nhs.uk",
                "mayoclinic.org",
                "medscape.com",
            ],
        )
        return [
            {
                "title":   r.get("title", ""),
                "snippet": r.get("content", "")[:300],
                "url":     r.get("url", ""),
            }
            for r in response.get("results", [])
        ]
    except Exception as e:
        return [{"title": "Search error", "snippet": str(e), "url": ""}]

async def search_all_claims(claims: list[str]) -> list[dict]:
    loop = asyncio.get_event_loop()
    results = await asyncio.gather(
        *[loop.run_in_executor(None, search_claim, claim) for claim in claims]
    )
    return [{"claim": claim, "sources": sources} 
            for claim, sources in zip(claims, results)]