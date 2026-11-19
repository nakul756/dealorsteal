import { Suspense } from "react";
import { AgentChat } from "./AgentChat";

export const metadata = { title: "AI Agent — Deal or Steal" };

export default function AgentPage() {
  return (
    <Suspense fallback={<div className="h-[70vh]" />}>
      <AgentChat />
    </Suspense>
  );
}
