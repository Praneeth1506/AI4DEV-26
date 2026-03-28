export default function TypingIndicator({ agentName, color }) {
  const dotColor = color || "bg-slate-400";

  return (
    <div className="flex items-center gap-3 px-4 py-3 animate-fade-slide-in">
      <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
      <div className="flex items-center gap-2 bg-white border border-slate-100 rounded-2xl rounded-tl-sm px-4 py-2.5 shadow-sm">
        <span className="text-sm text-slate-500 font-medium">{agentName} is thinking</span>
        <span className="flex gap-1 ml-1">
          <span className={`w-1.5 h-1.5 ${dotColor} rounded-full dot-bounce-0`} />
          <span className={`w-1.5 h-1.5 ${dotColor} rounded-full dot-bounce-1`} />
          <span className={`w-1.5 h-1.5 ${dotColor} rounded-full dot-bounce-2`} />
        </span>
      </div>
    </div>
  );
}
