import AgentCard from "./AgentCard";
import TypingIndicator from "./TypingIndicator";
import ConfidenceMeter from "./ConfidenceMeter";
import VerdictCard from "./VerdictCard";
import { AGENT_CONFIG } from "./AgentCard";
import { useEffect, useRef } from "react";

export default function DebatePanel({ events, thinkingAgent, isComplete }) {
  const bottomRef = useRef(null);

  // Auto-scroll to bottom on new events
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [events, thinkingAgent]);

  const resolverEvent = events.find(
    (e) => e.agent === "resolver" && e.status === "done"
  );

  const thinkingConfig = thinkingAgent ? (AGENT_CONFIG[thinkingAgent] ?? AGENT_CONFIG.system) : null;

  return (
    <div className="flex flex-col gap-2">
      {/* Live agent messages */}
      {events
        .filter((e) => e.status === "done" && e.content)
        .map((event, idx) => (
          <AgentCard
            key={idx}
            agent={event.agent}
            round={event.round}
            content={event.content}
          />
        ))}

      {/* Thinking indicator */}
      {thinkingAgent && thinkingConfig && (
        <TypingIndicator
          agentName={thinkingConfig.label}
          color={thinkingConfig.dot}
        />
      )}

      {/* Final verdict section */}
      {isComplete && resolverEvent && (
        <>
          <VerdictCard
            resolverContent={resolverEvent.content}
            allEvents={events}
          />
          <ConfidenceMeter resolverContent={resolverEvent.content} />
        </>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
