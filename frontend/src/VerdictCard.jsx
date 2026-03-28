import { useMemo } from "react";

/**
 * Parses resolver output to extract structured verdict data.
 * Looks for AGREED_ON, DISAGREED_ON, TIE_BROKEN_ON sections, or
 * falls back to heuristic extraction.
 */
function parseVerdictSections(resolverContent, allEvents) {
  if (!resolverContent) return null;

  // Extract section content from tagged lines
  const extractSection = (tag) => {
    const regex = new RegExp(`${tag}:\\s*([^\\n]+(?:\\n(?!\\w+:)[^\\n]*)*)`, "i");
    const match = resolverContent.match(regex);
    return match ? match[1].trim() : null;
  };

  const agreed = extractSection("AGREED_ON");
  const disagreed = extractSection("DISAGREED_ON");
  const tieBroken = extractSection("TIE_BROKEN_ON");

  // Extract confidence progression from events (e.g., round scores)
  const confidenceHistory = [];
  allEvents.forEach((e) => {
    const m = e.content?.match(/CONFIDENCE_SCORE:\s*(\d+)/i);
    if (m) confidenceHistory.push({ agent: e.agent, round: e.round, score: parseInt(m[1]) });
  });

  // Extract final score from resolver
  const finalScoreMatch = resolverContent.match(/CONFIDENCE_SCORE:\s*(\d+)/i);
  const finalScore = finalScoreMatch ? parseInt(finalScoreMatch[1]) : null;

  return { agreed, disagreed, tieBroken, confidenceHistory, finalScore };
}

function ConfidencePipeline({ history }) {
  if (!history || history.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap mt-1">
      {history.map((h, i) => (
        <div key={i} className="flex items-center gap-1">
          <span className="text-xs font-mono font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg px-2 py-0.5">
            {h.score}
          </span>
          {i < history.length - 1 && (
            <svg className="w-3 h-3 text-slate-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          )}
        </div>
      ))}
    </div>
  );
}

export default function VerdictCard({ resolverContent, allEvents }) {
  const verdict = useMemo(
    () => parseVerdictSections(resolverContent, allEvents),
    [resolverContent, allEvents]
  );

  if (!verdict) return null;

  const hasAnyContent = verdict.agreed || verdict.disagreed || verdict.tieBroken || verdict.confidenceHistory.length > 0;
  if (!hasAnyContent) return null;

  return (
    <div className="mt-2 rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50 overflow-hidden shadow-sm animate-fade-slide-in">
      {/* Header */}
      <div className="px-5 py-3 bg-violet-100/70 border-b border-violet-200 flex items-center gap-2.5">
        <div className="w-6 h-6 rounded-lg bg-violet-600 flex items-center justify-center shrink-0">
          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-bold text-violet-900">Consensus Verdict</p>
          <p className="text-xs text-violet-600 font-medium">What the agents agreed and disagreed on</p>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 py-4 space-y-4">

        {/* Agreed */}
        {verdict.agreed && (
          <div className="flex gap-3">
            <div className="w-5 h-5 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center shrink-0 mt-0.5">
              <svg className="w-3 h-3 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-1">Agents agreed on</p>
              <p className="text-sm text-slate-700 leading-relaxed">{verdict.agreed}</p>
            </div>
          </div>
        )}

        {/* Disagreed */}
        {verdict.disagreed && (
          <div className="flex gap-3">
            <div className="w-5 h-5 rounded-full bg-rose-100 border border-rose-200 flex items-center justify-center shrink-0 mt-0.5">
              <svg className="w-3 h-3 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-bold text-rose-700 uppercase tracking-wide mb-1">Points of contention</p>
              <p className="text-sm text-slate-700 leading-relaxed">{verdict.disagreed}</p>
            </div>
          </div>
        )}

        {/* Tie broken */}
        {verdict.tieBroken && (
          <div className="flex gap-3">
            <div className="w-5 h-5 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0 mt-0.5">
              <svg className="w-3 h-3 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-1">Resolver broke the tie on</p>
              <p className="text-sm text-slate-700 leading-relaxed">{verdict.tieBroken}</p>
            </div>
          </div>
        )}

        {/* Confidence history */}
        {verdict.confidenceHistory.length > 0 && (
          <div className="pt-3 border-t border-violet-200">
            <p className="text-xs font-bold text-violet-700 uppercase tracking-wide mb-2">Confidence across rounds</p>
            <ConfidencePipeline history={verdict.confidenceHistory} />
          </div>
        )}
      </div>
    </div>
  );
}
