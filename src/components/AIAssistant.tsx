import { useState, useRef, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Bot, X, Send, Loader2, Sparkles, LifeBuoy } from "lucide-react";
import { chatWithAssistant } from "@/lib/ai-assistant.functions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Msg = { role: "user" | "assistant"; content: string };

const WELCOME: Msg = {
  role: "assistant",
  content:
    "Hi! I'm NEXA AI 👋 I can help with orders, delivery, products, loyalty rewards and more. How can I help today?",
};

export function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [escalating, setEscalating] = useState(false);
  const [contact, setContact] = useState({ name: "", phone: "" });
  const scrollRef = useRef<HTMLDivElement>(null);
  const chat = useServerFn(chatWithAssistant);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, open]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const { reply, escalate } = await chat({
        data: { messages: next.slice(-10).map((m) => ({ role: m.role, content: m.content })) },
      });
      setMessages((m) => [...m, { role: "assistant", content: reply || "I'm here to help." }]);
      if (escalate) setEscalating(true);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Something went wrong.";
      toast.error(msg);
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Sorry, I couldn't respond right now. Please try again or contact our team on WhatsApp." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function submitEscalation() {
    if (!contact.name.trim() || !contact.phone.trim()) {
      toast.message("Please add your name and phone so we can follow up.");
      return;
    }
    const transcript = messages
      .map((m) => `${m.role === "user" ? "Customer" : "NEXA AI"}: ${m.content}`)
      .join("\n");
    const { error } = await supabase.from("contact_messages").insert({
      name: contact.name,
      email: "ai-escalation@nexatrademart.local",
      phone: contact.phone,
      subject: "AI Escalation",
      message: transcript,
    });
    if (error) {
      toast.error("Could not submit. Please contact us on WhatsApp.");
      return;
    }
    toast.success("Forwarded to our team — we'll be in touch shortly.");
    setEscalating(false);
    setContact({ name: "", phone: "" });
    setMessages((m) => [
      ...m,
      { role: "assistant", content: "Thanks! Our support team will reach out to you shortly. ✨" },
    ]);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Chat with NEXA AI"
        className="fixed bottom-24 right-5 z-50 h-14 w-14 rounded-full bg-ink text-gold border border-gold/40 shadow-gold flex items-center justify-center hover:scale-105 transition"
      >
        <Bot className="h-6 w-6" />
        <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-gold animate-pulse" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 sm:inset-auto sm:right-5 sm:bottom-5 sm:top-auto sm:left-auto">
          <div className="absolute inset-0 bg-black/50 sm:hidden" onClick={() => setOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 sm:static sm:w-[380px] h-[80vh] sm:h-[560px] sm:rounded-2xl bg-background border border-border shadow-2xl flex flex-col overflow-hidden">
            <header className="flex items-center justify-between p-4 bg-ink text-white">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-full bg-gold/20 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-gold" />
                </div>
                <div>
                  <div className="font-display text-sm">NEXA AI Assistant</div>
                  <div className="text-[10px] text-white/60">Online · 24/7</div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-white/10">
                <X className="h-5 w-5" />
              </button>
            </header>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-secondary/30">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap ${
                      m.role === "user" ? "bg-ink text-white rounded-br-sm" : "bg-background border rounded-bl-sm"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-background border rounded-2xl px-3 py-2 text-sm inline-flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin" /> Thinking…
                  </div>
                </div>
              )}

              {escalating && (
                <div className="rounded-xl border border-gold/40 bg-gold/5 p-3 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-gold-deep">
                    <LifeBuoy className="h-3.5 w-3.5" /> Forward to support team
                  </div>
                  <input
                    placeholder="Your name"
                    maxLength={80}
                    value={contact.name}
                    onChange={(e) => setContact({ ...contact, name: e.target.value })}
                    className="w-full h-9 rounded-lg border bg-background px-2 text-sm"
                  />
                  <input
                    placeholder="Phone number"
                    maxLength={30}
                    value={contact.phone}
                    onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                    className="w-full h-9 rounded-lg border bg-background px-2 text-sm"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={submitEscalation}
                      className="flex-1 h-9 rounded-lg gradient-gold text-ink text-xs font-bold"
                    >
                      Send to support
                    </button>
                    <button
                      onClick={() => setEscalating(false)}
                      className="h-9 px-3 rounded-lg border text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 border-t bg-background">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder="Ask about orders, delivery, products…"
                  maxLength={500}
                  className="flex-1 h-10 rounded-lg border bg-background px-3 text-sm outline-none focus:border-gold"
                />
                <button
                  onClick={send}
                  disabled={loading || !input.trim()}
                  className="h-10 w-10 rounded-lg bg-ink text-white inline-flex items-center justify-center disabled:opacity-50"
                  aria-label="Send"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-1 text-[10px] text-muted-foreground text-center">
                AI replies are guidance only. For urgent matters, use WhatsApp.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
