import { useState, useCallback, useRef } from "react";
import DebatePanel from "./DebatePanel";
import { startDebate } from "./api";

const DEMO_QUERIES = [
  "Is it safe to take paracetamol and ibuprofen together?",
  "Should metformin be the first-line treatment for Type 2 diabetes?",
  "Is there evidence that SSRIs are effective for adolescent depression?",
];

const AGENT_LEGEND = [
  { label: "Solver",             badge: "bg-teal-100 text-teal-800",   dot: "bg-teal-400"   },
  { label: "Critic",             badge: "bg-rose-100 text-rose-800",   dot: "bg-rose-400"   },
  { label: "Gemini Challenger",  badge: "bg-purple-100 text-purple-800", dot: "bg-purple-400" },
  { label: "Verifier",           badge: "bg-blue-100 text-blue-800",   dot: "bg-blue-400"   },
  { label: "Resolver",           badge: "bg-amber-100 text-amber-800", dot: "bg-amber-400"  },
];

export default function App() {
  const [query, setQuery] = useState("");
  const [events, setEvents] = useState([]);
  const [thinkingAgent, setThinkingAgent] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState(null);
  const cleanupRef = useRef(null);

  const handleEvent = useCallback((event) => {
    if (event.status === "thinking") {
      setThinkingAgent(event.agent);
    } else {
      setThinkingAgent(null);
      setEvents((prev) => [...prev, event]);
    }
  }, []);

  const handleSubmit = () => {
    if (!query.trim() || isRunning) return;

    // Abort any previous stream
    cleanupRef.current?.();

    setEvents([]);
    setThinkingAgent(null);
    setIsComplete(false);
    setIsRunning(true);
    setError(null);

    const cleanup = startDebate(
      query,
      handleEvent,
      () => {
        setIsComplete(true);
        setIsRunning(false);
      },
      (err) => {
        console.error(err);
        setError("Could not connect to the debate server. Make sure the backend is running on port 8000.");
        setIsRunning(false);
      }
    );

    cleanupRef.current = cleanup;
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const showDebatePanel = events.length > 0 || thinkingAgent;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 py-10 px-4">
      <div className="max-w-2xl mx-auto">

        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4 border border-violet-200">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
            Multi-Agent AI System · PS1
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
            Debate Engine
          </h1>
          <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
            Four AI agents debate your question in real time and produce a
            verified, confidence-scored answer.
          </p>
        </div>

        {/* ── Input card ──────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-4 shadow-sm ring-1 ring-slate-100">
          <textarea
            id="debate-query"
            className="w-full text-sm text-slate-800 bg-transparent resize-none outline-none placeholder-slate-400 leading-relaxed"
            rows={3}
            placeholder="Ask a complex question — medical, historical, financial…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
            {/* Demo pills */}
            <div className="flex gap-2 flex-wrap">
              {DEMO_QUERIES.map((q, i) => (
                <button
                  key={i}
                  id={`demo-query-${i + 1}`}
                  onClick={() => setQuery(q)}
                  className="text-xs text-teal-700 bg-teal-50 border border-teal-200 rounded-full px-3 py-1 hover:bg-teal-100 transition-colors cursor-pointer font-medium"
                >
                  Demo {i + 1}
                </button>
              ))}
            </div>

            {/* Submit button */}
            <button
              id="start-debate-btn"
              onClick={handleSubmit}
              disabled={isRunning || !query.trim()}
              className="flex items-center gap-2 text-sm font-semibold bg-slate-900 text-white rounded-xl px-5 py-2 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              {isRunning ? (
                <>
                  <span className="w-3 h-3 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  Debating…
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Start debate
                </>
              )}
            </button>
          </div>
        </div>

        {/* ── Error banner ─────────────────────────────────────────── */}
        {error && (
          <div className="mb-4 flex items-start gap-3 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 animate-fade-slide-in">
            <svg className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-sm text-rose-700">{error}</p>
          </div>
        )}

        {/* ── Agent legend ─────────────────────────────────────────── */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="text-xs text-slate-400 font-medium mr-1">Agents:</span>
          {AGENT_LEGEND.map((a) => (
            <span
              key={a.label}
              className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${a.badge}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${a.dot}`} />
              {a.label}
            </span>
          ))}
        </div>

        {/* ── Debate feed ──────────────────────────────────────────── */}
        {showDebatePanel && (
          <div id="debate-feed">
            <DebatePanel
              events={events}
              thinkingAgent={thinkingAgent}
              isComplete={isComplete}
            />
          </div>
        )}

        {/* ── Empty state ──────────────────────────────────────────── */}
        {!showDebatePanel && !error && (
          <div className="text-center py-16 text-slate-300">
            <svg className="w-12 h-12 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-sm font-medium">Ask a question to start a live debate</p>
          </div>
        )}

        {/* ── Footer ──────────────────────────────────────────────── */}
        <div className="mt-10 text-center text-xs text-slate-300 font-medium">
          Multi-Agent Debate · PS1 · Powered by SSE streaming
        </div>

      </div>
    </div>
  );
}
