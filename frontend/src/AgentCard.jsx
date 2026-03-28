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

export default function AgentCard({ agent, round, content }) {
  const config = AGENT_CONFIG[agent] ?? AGENT_CONFIG.system;

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
        <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed font-normal tracking-tight">
          {content}
        </p>
      </div>
    </div>
  );
}
