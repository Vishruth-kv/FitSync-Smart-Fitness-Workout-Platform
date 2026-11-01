"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Send, Bot, User as UserIcon, Loader2, Dumbbell, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Msg { role: "user" | "assistant"; content: string; }

const SUGGESTIONS = [
  "Create a 4-day muscle gain workout plan",
  "How much protein should I eat daily?",
  "What is a Push Pull Legs split?",
  "Give me a beginner home workout routine",
  "Tips for faster fat loss",
  "How to improve squat form?",
];

export default function CoachPage() {
  const router = useRouter();
  const [me, setMe] = useState<{ name: string } | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      const r = await fetch("/api/auth/me");
      if (!r.ok) { router.push("/login"); return; }
      setMe((await r.json()).user);
    }
    load();
  }, [router]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function send(text?: string) {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput("");
    const next: Msg[] = [...messages, { role: "user", content: msg }];
    setMessages(next);
    setLoading(true);

    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      setMessages([...next, { role: "assistant", content: data.reply || "Sorry, I couldn't get a response. Please try again." }]);
    } catch {
      setMessages([...next, { role: "assistant", content: "Connection error. Please try again." }]);
    }
    setLoading(false);
  }

  if (!me) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-muted-foreground font-semibold">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <Bot className="h-8 w-8 text-primary" />
          <p>Connecting to your coach…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-primary/5 to-transparent rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-secondary/5 to-transparent rounded-full blur-[100px] -z-10" />

      <Navbar userName={me?.name?.split(" ")[0] || "…"} />
      
      <main className="flex-1 container mx-auto px-4 sm:px-8 py-8 max-w-4xl flex flex-col h-[calc(100vh-64px)]">
        <div className="mb-6 shrink-0">
          <h1 className="text-3xl font-black tracking-tight mb-2 flex items-center gap-3">
            <div className="bg-primary/20 p-2 rounded-xl"><Bot className="w-8 h-8 text-primary" /></div>
            AI Fitness Coach
          </h1>
          <p className="text-muted-foreground text-lg ml-14">Ask anything about workouts, diet, form, or recovery.</p>
        </div>

        {/* Chat area */}
        <div className="flex-1 overflow-y-auto pb-6 scrollbar-hide flex flex-col gap-6 relative px-2">
          {messages.length === 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-8 h-full justify-center">
              <Card className="border-primary/20 bg-primary/5 backdrop-blur-sm shadow-xl shadow-primary/5">
                <CardContent className="p-8 text-center flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-2">
                    <Sparkles className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold">Hi {me?.name?.split(" ")[0] || "there"}! I&apos;m your AI coach. 💪</h2>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Ask me to create workout plans, explain exercises, suggest a diet, or anything else fitness-related.
                  </p>
                </CardContent>
              </Card>
              
              <div>
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4 px-2">Quick Questions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SUGGESTIONS.map((s, i) => (
                    <motion.button 
                      key={s} 
                      onClick={() => send(s)}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + (i * 0.05) }}
                      className="text-left p-4 rounded-xl bg-background/50 border border-border/50 text-sm font-semibold hover:border-primary/50 hover:bg-muted transition-all flex items-center gap-3 group shadow-sm hover:shadow-md"
                    >
                      <Dumbbell className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                      {s}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((m, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex gap-4 ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.role === "assistant" && (
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-1 border border-primary/30 shadow-md">
                    <Bot className="w-5 h-5 text-primary" />
                  </div>
                )}
                
                <div className={`
                  max-w-[85%] px-5 py-4 text-[15px] leading-relaxed shadow-md overflow-hidden
                  ${m.role === "user" 
                    ? "rounded-2xl rounded-tr-sm bg-primary text-primary-foreground font-medium" 
                    : "rounded-2xl rounded-tl-sm bg-background/80 backdrop-blur-sm border border-border/50 text-foreground"
                  }
                `}>
                  {m.role === "assistant" ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none prose-img:rounded-xl prose-img:shadow-md prose-headings:mb-2 prose-p:mb-2">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          a: ({ node, ...props }) => {
                            const href = props.href || "";
                            if (href.includes("youtube.com/watch?v=") || href.includes("youtu.be/")) {
                              const videoId = href.includes("v=") 
                                ? href.split("v=")[1].split("&")[0] 
                                : href.split("youtu.be/")[1].split("?")[0];
                              return (
                                <div className="aspect-video w-full my-4 rounded-xl overflow-hidden shadow-lg border border-border/50 bg-black/5">
                                  <iframe 
                                    src={`https://www.youtube.com/embed/${videoId}`} 
                                    className="w-full h-full border-0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                  />
                                </div>
                              );
                            }
                            return <a {...props} className="text-primary hover:underline font-semibold" target="_blank" rel="noopener noreferrer" />;
                          }
                        }}
                      >
                        {m.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    m.content.split('\n').map((line, j) => (
                      <span key={j}>{line}<br/></span>
                    ))
                  )}
                </div>

                {m.role === "user" && (
                  <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center shrink-0 mt-1 border border-secondary/30 shadow-md">
                    <UserIcon className="w-5 h-5 text-secondary" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-4 justify-start">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-1 border border-primary/30">
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
              </div>
              <div className="px-5 py-4 rounded-2xl rounded-tl-sm bg-background/80 backdrop-blur-sm border border-border/50 text-muted-foreground flex items-center gap-2 shadow-sm">
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "300ms" }} />
                </span>
              </div>
            </motion.div>
          )}
          <div ref={bottomRef} className="h-4 shrink-0" />
        </div>

        {/* Input */}
        <div className="shrink-0 pt-4 pb-8 bg-gradient-to-t from-background via-background to-transparent sticky bottom-0 z-10 px-2">
          <form 
            onSubmit={(e) => { e.preventDefault(); send(); }}
            className="flex gap-3 relative max-w-4xl mx-auto"
          >
            <Input 
              value={input} 
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask your fitness coach…"
              className="h-14 pr-16 bg-background/90 backdrop-blur-xl border-border/50 shadow-lg text-base rounded-2xl focus-visible:ring-primary/50"
            />
            <Button 
              type="submit" 
              disabled={loading || !input.trim()}
              size="icon"
              className="absolute right-2 top-2 h-10 w-10 rounded-xl shadow-md transition-transform hover:scale-105 active:scale-95 disabled:hover:scale-100"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
