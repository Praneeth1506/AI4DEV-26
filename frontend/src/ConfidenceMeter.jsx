export default function ConfidenceMeter({ resolverContent }) {
  const match = resolverContent?.match(/CONFIDENCE_SCORE:\s*(\d+)/i);
  const score = match ? parseInt(match[1]) : null;

  const gradeMatch = resolverContent?.match(/RELIABILITY_GRADE:\s*([A-D][+-]?)/i);
  const grade = gradeMatch ? gradeMatch[1] : null;

  if (!score) return null;

  const color =
    score >= 80 ? "bg-emerald-500" :
    score >= 60 ? "bg-amber-400" :
    "bg-rose-400";

  const labelColor =
    score >= 80 ? "text-emerald-600" :
    score >= 60 ? "text-amber-600" :
    "text-rose-600";

  const verdict =
    score >= 80 ? "High Confidence" :
    score >= 60 ? "Moderate Confidence" :
    "Low Confidence";

  return (
    <div className="mt-2 rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm animate-fade-slide-in">
      {/* Header */}
      <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span className="text-sm font-semibold text-slate-700">Reliability Score</span>
        </div>
        <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-medium">Final verdict</span>
      </div>

      {/* Score display */}
      <div className="px-5 py-4">
        <div className="flex items-end justify-between mb-3">
          <div>
            <span className={`text-4xl font-black tracking-tight ${labelColor}`}>{score}</span>
            <span className="text-slate-400 text-lg font-semibold">/100</span>
          </div>
          <div className="text-right">
            {grade && (
              <div className="text-2xl font-black text-slate-800 leading-none">
                Grade <span className={labelColor}>{grade}</span>
              </div>
            )}
            <div className={`text-xs font-semibold mt-1 ${labelColor}`}>{verdict}</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
          <div
            className={`h-3 rounded-full transition-all duration-1000 ease-out ${color}`}
            style={{ width: `${score}%` }}
          />
        </div>

        {/* Scale labels */}
        <div className="flex justify-between mt-1.5 text-xs text-slate-400 font-medium">
          <span>0</span>
          <span>50</span>
          <span>100</span>
        </div>
      </div>
    </div>
  );
}
