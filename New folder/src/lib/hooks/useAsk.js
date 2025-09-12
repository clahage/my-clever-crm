// src/lib/hooks/useAsk.js
import { useCallback, useRef, useState } from "react";
import { askChat } from "../api/askClient";

export function useAsk() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reply, setReply] = useState("");
  const abortRef = useRef(null);

  const send = useCallback(async (userText) => {
    setLoading(true); setError(""); setReply("");
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    try {
      const payload = {
        messages: [{ role: "user", content: userText }],
      };
      const data = await askChat({ ...payload, signal: abortRef.current.signal });
      const text = data?.text || data?.raw?.choices?.[0]?.message?.content || "";
      setReply(text);
      return text;
    } catch (e) {
      // Rate limit UX: if 429, show a friendly message
      if (e?.message?.includes('429')) {
        setError('Rate limit exceeded. Please try again soon.');
      } else {
        setError(e?.message || "Request failed");
      }
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return { loading, error, reply, send, cancel };
}
