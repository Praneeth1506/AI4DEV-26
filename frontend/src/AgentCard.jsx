const AGENT_CONFIG = {
  solver: {
    label: "Solver",
    bg: "bg-teal-50",
    border: "border-teal-200",
    badge: "bg-teal-100 text-teal-800",
    dot: "bg-teal-400",
    accent: "text-teal-600",
    headerBg: "bg-teal-100/60",
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  critic: {
    label: "Critic",
    bg: "bg-rose-50",
    border: "border-rose-200",
    badge: "bg-rose-100 text-rose-800",
    dot: "bg-rose-400",
    accent: "text-rose-600",
    headerBg: "bg-rose-100/60",
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  },
  gemini_challenger: {
    label: "Gemini Challenger",
    bg: "bg-purple-50",
    border: "border-purple-200",
    badge: "bg-purple-100 text-purple-800",
    dot: "bg-purple-400",
    accent: "text-purple-600",
    headerBg: "bg-purple-100/60",
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  verifier: {
    label: "Verifier",
    bg: "bg-blue-50",
    border: "border-blue-200",
    badge: "bg-blue-100 text-blue-800",
    dot: "bg-blue-400",
    accent: "text-blue-600",
    headerBg: "bg-blue-100/60",
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  resolver: {
    label: "Resolver",
    bg: "bg-amber-50",
    border: "border-amber-200",
    badge: "bg-amber-100 text-amber-800",
    dot: "bg-amber-400",
    accent: "text-amber-600",
    headerBg: "bg-amber-100/60",
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
      </svg>
    ),
  },
  system: {
    label: "System",
    bg: "bg-slate-50",
    border: "border-slate-200",
    badge: "bg-slate-100 text-slate-600",
    dot: "bg-slate-400",
    accent: "text-slate-500",
    headerBg: "bg-slate-100/60",
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
      </svg>
    ),
  },
};

export { AGENT_CONFIG };

// Try to parse verifier structured JSON output
function tryParseVerifierJSON(content) {
  if (!content) return null;
  try {
    const parsed = JSON.parse(content);
    if (parsed && Array.isArray(parsed.claims)) return parsed;
  } catch (_) {}
  return null;
}

const VERDICT_INLINE = {
  CONFIRMED:   { bg: "#EAF3DE", color: "#27500A" },
  DISPUTED:    { bg: "#FAECE7", color: "#712B13" },
  UNSUPPORTED: { bg: "#F1EFE8", color: "#444441" },
};

function VerifierStructured({ data }) {
  const { claims, trust_score } = data;

  const scoreColor =
    trust_score >= 75 ? "#16a34a" :
    trust_score >= 45 ? "#d97706" :
    "#dc2626";

  const barColor =
    trust_score >= 75 ? "#22c55e" :
    trust_score >= 45 ? "#fbbf24" :
    "#f87171";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {claims.map((c, i) => {
        const vs = VERDICT_INLINE[c.verdict] ?? VERDICT_INLINE.UNSUPPORTED;
        return (
          <div key={i} style={{ background: "rgba(255,255,255,0.7)", borderRadius: 12, border: "1px solid #f1f5f9", padding: 12 }}>
            {/* Claim text */}
            <p style={{ fontSize: 12, fontStyle: "italic", color: "#64748b", margin: 0, marginBottom: 3, lineHeight: 1.5 }}>{c.claim}</p>

            {/* Verdict pill */}
            <span style={{
              display: "inline-block",
              fontSize: 10,
              fontWeight: 700,
              padding: "2px 8px",
              borderRadius: 999,
              background: vs.bg,
              color: vs.color,
              marginBottom: 6,
            }}>
              {c.verdict}
            </span>

            {/* Reason */}
            {c.reason && (
              <p style={{ fontSize: 12, color: "#64748b", margin: 0, marginBottom: c.sources?.length ? 6 : 0, lineHeight: 1.5 }}>{c.reason}</p>
            )}

            {/* Source pills */}
            {c.sources?.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {c.sources.map((s, j) =>
                  s.url ? (
                    <a
                      key={j}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: 10,
                        padding: "2px 8px",
                        borderRadius: 999,
                        background: "#E6F1FB",
                        color: "#0C447C",
                        textDecoration: "none",
                        maxWidth: 220,
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                        display: "inline-block",
                      }}
                    >
                      {(s.title || s.url).slice(0, 30)}{(s.title || s.url).length > 30 ? "…" : ""}
                    </a>
                  ) : null
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Trust score row */}
      <div style={{ borderTop: "0.5px solid var(--color-border-tertiary, #e2e8f0)", paddingTop: 10 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ fontSize: 12, color: "var(--color-text-secondary, #64748b)" }}>Trust score:</span>
          <span style={{ fontSize: 14, color: "var(--color-text-primary, #0f172a)", fontWeight: 600 }}>
            {trust_score}%
          </span>
        </div>
        <div style={{ width: "100%", background: "#f1f5f9", borderRadius: 999, height: 6, overflow: "hidden" }}>
          <div style={{ height: 6, borderRadius: 999, background: barColor, width: `${trust_score}%`, transition: "width 0.7s ease-out" }} />
        </div>
      </div>
    </div>
  );
}

export default function AgentCard({ agent, round, content }) {
  const config = AGENT_CONFIG[agent] ?? AGENT_CONFIG.system;
  const verifierData = agent === "verifier" ? tryParseVerifierJSON(content) : null;

  return (
    <div
      className={`rounded-2xl border ${config.bg} ${config.border} overflow-hidden shadow-sm animate-fade-slide-in`}
    >
      {/* Card header */}
      <div className={`flex items-center justify-between px-4 py-2.5 ${config.headerBg} border-b ${config.border}`}>
        <div className="flex items-center gap-2">
          <span className={`${config.accent}`}>{config.icon}</span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${config.badge}`}>
            {config.label}
          </span>
          {round > 0 && (
            <span className="text-xs text-slate-400 font-medium">
              Round {round}
            </span>
          )}
        </div>
        <span className={`w-2 h-2 rounded-full ${config.dot}`} />
      </div>

      {/* Card body */}
      <div className="px-4 py-3">
        {verifierData ? (
          <VerifierStructured data={verifierData} />
        ) : (
          <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed font-normal tracking-tight">
            {content}
          </p>
        )}
      </div>
    </div>
  );
}
