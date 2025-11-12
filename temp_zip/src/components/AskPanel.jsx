import React, { useState } from "react";
import { useAsk } from "../lib/hooks/useAsk";
import { analytics } from "../lib/firebase";

export default function AskPanel() {
  const [text, setText] = useState("");
  const { loading, error, reply, send, cancel } = useAsk();

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      await send(text.trim());
      if (analytics?.logEvent) analytics.logEvent("ask_success", { prompt: text.trim() });
    } catch (err) {
      if (analytics?.logEvent) analytics.logEvent("ask_failure", { prompt: text.trim(), error: err?.message });
    }
  };

  return (
    <div className="rounded-3xl p-6 ring-1 ring-white/10 bg-white/5">
      <div className="text-white/80 font-medium mb-3">Assistant</div>
      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 rounded-xl bg-white/10 text-white placeholder-white/50 px-3 py-2 ring-1 ring-white/10 focus:outline-none focus:ring-white/30"
          placeholder="Ask anything… e.g., draft a dispute reason for late payment"
        />
        {!loading ? (
          <button type="submit" className="rounded-xl px-4 py-2 bg-white/90 text-slate-900 font-medium hover:bg-white">
            Send
          </button>
        ) : (
          <button type="button" onClick={cancel} className="rounded-xl px-4 py-2 bg-white/20 text-white hover:bg-white/30">
            Cancel
          </button>
        )}
      </form>
      {error && <div className="mt-3 text-sm text-rose-400">{error}</div>}
      {reply && (
        <div className="mt-4 rounded-xl bg-white/5 p-3 ring-1 ring-white/10 text-white/90 whitespace-pre-wrap">
          {reply}
        </div>
      )}
    </div>
  );
}
