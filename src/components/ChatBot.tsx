import React, { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Mic, MicOff, Volume2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

type Message = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;
const TTS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tts`;
const STT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stt`;
const ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const WELCOME_MSG = "مرحباً بك في Luxury Finishing! 👋\nأنا مساعدك الذكي، كيف يمكنني مساعدتك اليوم؟";

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: WELCOME_MSG },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [playingTts, setPlayingTts] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // Stream chat
  const streamChat = useCallback(
    async (allMessages: Message[]) => {
      setLoading(true);
      let assistantSoFar = "";

      const upsert = (chunk: string) => {
        assistantSoFar += chunk;
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant" && last.content !== WELCOME_MSG) {
            return prev.map((m, i) =>
              i === prev.length - 1 ? { ...m, content: assistantSoFar } : m
            );
          }
          return [...prev, { role: "assistant", content: assistantSoFar }];
        });
      };

      try {
        const resp = await fetch(CHAT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${ANON_KEY}`,
          },
          body: JSON.stringify({ messages: allMessages }),
        });

        if (!resp.ok || !resp.body) throw new Error("Stream failed");

        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let buf = "";
        let done = false;

        while (!done) {
          const { done: d, value } = await reader.read();
          if (d) break;
          buf += decoder.decode(value, { stream: true });
          let nl: number;
          while ((nl = buf.indexOf("\n")) !== -1) {
            let line = buf.slice(0, nl);
            buf = buf.slice(nl + 1);
            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (!line.startsWith("data: ")) continue;
            const json = line.slice(6).trim();
            if (json === "[DONE]") { done = true; break; }
            try {
              const p = JSON.parse(json);
              const c = p.choices?.[0]?.delta?.content;
              if (c) upsert(c);
            } catch { buf = line + "\n" + buf; break; }
          }
        }
      } catch (e) {
        console.error(e);
        upsert("عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.");
      }
      setLoading(false);
    },
    []
  );

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    const userMsg: Message = { role: "user", content: text };
    const updated = [...messages, userMsg];
    setMessages(updated);
    await streamChat(updated);
  }, [input, loading, messages, streamChat]);

  // TTS
  const handleTts = useCallback(async (text: string) => {
    setPlayingTts(true);
    try {
      const resp = await fetch(TTS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ANON_KEY}`,
        },
        body: JSON.stringify({ text }),
      });
      if (!resp.ok) throw new Error("TTS failed");
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.onended = () => { setPlayingTts(false); URL.revokeObjectURL(url); };
      await audio.play();
    } catch (e) {
      console.error("TTS error:", e);
      setPlayingTts(false);
    }
  }, []);

  // STT - Record
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setLoading(true);
        try {
          const fd = new FormData();
          fd.append("audio", blob, "recording.webm");
          const resp = await fetch(STT_URL, {
            method: "POST",
            headers: { Authorization: `Bearer ${ANON_KEY}` },
            body: fd,
          });
          if (!resp.ok) throw new Error("STT failed");
          const data = await resp.json();
          if (data.text) {
            const userMsg: Message = { role: "user", content: data.text };
            setMessages((prev) => {
              const updated = [...prev, userMsg];
              streamChat(updated);
              return updated;
            });
          }
        } catch (e) {
          console.error("STT error:", e);
        }
        setLoading(false);
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setRecording(true);
    } catch (e) {
      console.error("Mic error:", e);
    }
  }, [streamChat]);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  }, []);

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-300 hover:scale-110",
          "bg-primary text-primary-foreground",
          open && "rotate-90"
        )}
        aria-label="فتح المحادثة"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[500px] w-[370px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl animate-in slide-in-from-bottom-4 fade-in duration-300">
          {/* Header */}
          <div className="flex items-center gap-3 bg-primary px-4 py-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-foreground font-bold text-lg">
              LF
            </div>
            <div className="flex-1 text-right">
              <p className="font-bold text-primary-foreground text-sm">Luxury Finishing AI</p>
              <p className="text-xs text-primary-foreground/70">مساعدك الذكي للتشطيبات</p>
            </div>
            <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3" dir="rtl">
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "flex",
                  m.role === "user" ? "justify-start" : "justify-end"
                )}
              >
                <div
                  className={cn(
                    "relative max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                    m.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-muted text-foreground rounded-bl-sm"
                  )}
                >
                  {m.role === "assistant" ? (
                    <div className="prose prose-sm max-w-none dark:prose-invert text-right [&>p]:m-0">
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-right">{m.content}</p>
                  )}
                  {m.role === "assistant" && m.content !== WELCOME_MSG && (
                    <button
                      onClick={() => handleTts(m.content)}
                      disabled={playingTts}
                      className="absolute -bottom-1 -left-1 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-accent-foreground hover:scale-110 transition-transform"
                      title="استمع"
                    >
                      <Volume2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-end">
                <div className="rounded-2xl bg-muted px-4 py-3 rounded-bl-sm">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="h-2 w-2 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="h-2 w-2 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-border p-3">
            <div className="flex items-center gap-2" dir="rtl">
              <button
                onClick={recording ? stopRecording : startRecording}
                disabled={loading && !recording}
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors",
                  recording
                    ? "bg-destructive text-destructive-foreground animate-pulse"
                    : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
                title={recording ? "إيقاف التسجيل" : "تسجيل صوتي"}
              >
                {recording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="اكتب رسالتك..."
                disabled={loading || recording}
                className="flex-1 rounded-full border border-border bg-muted/50 px-4 py-2 text-sm text-right outline-none focus:ring-2 focus:ring-primary/30"
                dir="rtl"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors",
                  input.trim()
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 rotate-180" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
