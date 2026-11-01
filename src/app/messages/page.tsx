"use client";

import { useEffect, useState, useRef, FormEvent, ChangeEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Search, Phone, Video, Info, Image as ImageIcon, Send, ArrowLeft, MoreVertical, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface User {
  id: string;
  name: string;
  profile?: {
    fitnessGoal?: string;
    fitnessLevel?: string;
  };
}

interface Message {
  id: string;
  senderId: string;
  content: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

interface Conversation {
  id: string;
  otherUser: User;
  lastMessage: Message | null;
  unreadCount: number;
  updatedAt: string;
}

export default function MessagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetUserId = searchParams.get("userId");

  const [me, setMe] = useState<{ id: string; name: string } | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeUser, setActiveUser] = useState<User | null>(null);
  
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Initial Load & Auth
  useEffect(() => {
    async function init() {
      const meRes = await fetch("/api/auth/me");
      if (!meRes.ok) { router.push("/login"); return; }
      const meData = await meRes.json();
      setMe(meData.user);

      // Fetch conversations
      await fetchConversations();

      // Handle ?userId= target
      if (targetUserId) {
        await startOrOpenConversation(targetUserId);
      }
    }
    init();
  }, [router, targetUserId]);

  const fetchConversations = async () => {
    const res = await fetch("/api/messages");
    if (res.ok) {
      const data = await res.json();
      setConversations(data.conversations);
    }
  };

  // 2. Polling for updates
  useEffect(() => {
    if (!me) return;
    const interval = setInterval(() => {
      fetchConversations();
      if (activeConvId) {
        fetchMessages(activeConvId, false);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [me, activeConvId]);

  // 3. Mark read when active conv changes
  useEffect(() => {
    if (activeConvId) {
      fetchMessages(activeConvId, true);
      markAsRead(activeConvId);
      const conv = conversations.find(c => c.id === activeConvId);
      if (conv) setActiveUser(conv.otherUser);
    }
  }, [activeConvId]);

  // 4. Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startOrOpenConversation = async (userId: string) => {
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetUserId: userId })
    });
    if (res.ok) {
      const data = await res.json();
      setActiveConvId(data.conversationId);
      // Clean up URL without reload
      window.history.replaceState({}, '', '/messages');
      await fetchConversations();
    }
  };

  const fetchMessages = async (convId: string, markRead: boolean = false) => {
    const res = await fetch(`/api/messages/${convId}`);
    if (res.ok) {
      const data = await res.json();
      setMessages(data.messages);
      if (!activeUser && data.otherUser) setActiveUser(data.otherUser);
    }
    if (markRead) {
      markAsRead(convId);
    }
  };

  const markAsRead = async (convId: string) => {
    await fetch(`/api/messages/${convId}/read`, { method: "POST" });
    setConversations(prev => prev.map(c => c.id === convId ? { ...c, unreadCount: 0 } : c));
  };

  const handleSendMessage = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || !activeConvId) return;

    const content = inputText.trim();
    setInputText("");

    // Optimistic UI
    const tempMsg: Message = {
      id: Date.now().toString(),
      senderId: me!.id,
      content,
      type: "text",
      isRead: false,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempMsg]);

    const res = await fetch(`/api/messages/${activeConvId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, type: "text" })
    });
    if (res.ok) {
      await fetchConversations();
      fetchMessages(activeConvId);
    } else {
      // Revert optimistic update
      setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
      const errData = await res.json();
      alert(errData.error || "Failed to send message");
    }
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeConvId) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    if (res.ok) {
      const data = await res.json();
      
      const msgRes = await fetch(`/api/messages/${activeConvId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: data.url, type: "image" })
      });
      if (msgRes.ok) {
        await fetchMessages(activeConvId);
        await fetchConversations();
      } else {
        const errData = await msgRes.json();
        alert(errData.error || "Failed to send message");
      }
    }
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleBlockUser = async () => {
    if (!activeUser || !confirm(`Are you sure you want to block ${activeUser.name}? You will no longer be able to message each other.`)) return;
    
    const res = await fetch(`/api/users/${activeUser.id}/block`, { method: "POST" });
    if (res.ok) {
      alert("User blocked successfully.");
      setShowInfo(false);
    } else {
      alert("Failed to block user.");
    }
  };

  const handleActionStub = (action: string) => {
    alert(`${action} is not available right now. We'll roll this out soon!`);
  };

  const filteredConvs = conversations.filter(c => 
    c.otherUser?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!me) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden">
      <Navbar userName={me.name?.split(" ")[0] || "…"} />
      
      <main className="flex-1 container mx-auto max-w-6xl py-4 sm:py-8 px-0 sm:px-4 flex h-[calc(100vh-64px)] overflow-hidden">
        <div className="w-full flex bg-card rounded-none sm:rounded-3xl border-border/50 border overflow-hidden shadow-2xl">
          
          {/* LEFT PANEL: Conversation List */}
          <div className={cn(
            "w-full md:w-[350px] lg:w-[400px] flex flex-col border-r border-border/50 bg-background/50",
            activeConvId ? "hidden md:flex" : "flex"
          )}>
            <div className="p-4 border-b border-border/50 flex flex-col gap-4 bg-card z-10">
              <h1 className="text-2xl font-black tracking-tight">Messages</h1>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search conversations..." 
                  className="pl-9 bg-muted/50 border-none rounded-full focus-visible:ring-1 focus-visible:ring-primary"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredConvs.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground flex flex-col items-center gap-3">
                  <Search className="w-8 h-8 opacity-20" />
                  <p className="text-sm font-semibold">No conversations found.</p>
                </div>
              ) : (
                <div className="p-3 flex flex-col gap-1">
                  {filteredConvs.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setActiveConvId(c.id)}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-2xl transition-all text-left",
                        activeConvId === c.id 
                          ? "bg-primary text-primary-foreground shadow-md" 
                          : "hover:bg-muted"
                      )}
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-orange-400 to-primary flex items-center justify-center font-black text-white shadow-sm shrink-0">
                        {c.otherUser?.name?.[0]?.toUpperCase() || "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-0.5">
                          <span className="font-bold truncate">{c.otherUser?.name}</span>
                          {c.lastMessage && (
                            <span className={cn("text-[10px] shrink-0 font-medium", activeConvId === c.id ? "text-primary-foreground/80" : "text-muted-foreground")}>
                              {new Date(c.lastMessage.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                        <p className={cn(
                          "text-sm truncate",
                          c.unreadCount > 0 && activeConvId !== c.id ? "font-bold text-foreground" : 
                          activeConvId === c.id ? "text-primary-foreground/90" : "text-muted-foreground"
                        )}>
                          {c.lastMessage 
                            ? c.lastMessage.type === "image" ? "📷 Photo" : c.lastMessage.content 
                            : "Start a conversation!"}
                        </p>
                      </div>
                      {c.unreadCount > 0 && activeConvId !== c.id && (
                        <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-[10px] font-bold text-white shrink-0 shadow-sm">
                          {c.unreadCount}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT PANEL: Active Chat */}
          <div className={cn(
            "flex-1 flex flex-col bg-background/80 relative",
            !activeConvId ? "hidden md:flex" : "flex"
          )}>
            {!activeConvId ? (
              <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center bg-card">
                <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
                  <Send className="w-10 h-10 text-primary opacity-50 ml-1" />
                </div>
                <h2 className="text-2xl font-black mb-2 text-foreground">Your Messages</h2>
                <p className="max-w-xs">Select a conversation or find a match to start chatting.</p>
              </div>
            ) : (
              <>
                {/* Chat Header */}
                <div className="h-16 px-4 border-b border-border/50 flex items-center justify-between bg-card z-10">
                  <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" className="md:hidden -ml-2" onClick={() => setActiveConvId(null)}>
                      <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-400 to-primary flex items-center justify-center font-bold text-white shadow-sm cursor-pointer hover:opacity-80 transition-opacity" onClick={() => router.push(`/profile/${activeUser?.id}`)}>
                      {activeUser?.name?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div className="flex flex-col cursor-pointer" onClick={() => router.push(`/profile/${activeUser?.id}`)}>
                      <span className="font-bold leading-tight hover:underline">{activeUser?.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary rounded-full" onClick={() => handleActionStub("Voice calling")}>
                      <Phone className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary rounded-full" onClick={() => handleActionStub("Video calling")}>
                      <Video className="w-6 h-6" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary rounded-full" onClick={() => setShowInfo(!showInfo)}>
                      <Info className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed" style={{ backgroundSize: "40px" }}>
                  <div className="flex flex-col gap-3 pb-4">
                    {messages.map((msg, i) => {
                      const isMe = msg.senderId === me.id;
                      const showAvatar = !isMe && (i === 0 || messages[i-1].senderId !== msg.senderId);
                      
                      return (
                        <div key={msg.id} className={cn("flex flex-col", isMe ? "items-end" : "items-start")}>
                          <div className={cn("flex gap-2 max-w-[75%] sm:max-w-[65%]", isMe ? "flex-row-reverse" : "flex-row")}>
                            {!isMe && (
                              <div className="w-8 shrink-0 flex items-end">
                                {showAvatar && (
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-400 to-primary flex items-center justify-center font-bold text-white text-xs shadow-sm">
                                    {activeUser?.name?.[0]?.toUpperCase()}
                                  </div>
                                )}
                              </div>
                            )}
                            
                            <div className={cn(
                              "p-3 rounded-2xl relative group shadow-sm",
                              isMe ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-card border border-border/50 text-foreground rounded-bl-sm"
                            )}>
                              {msg.type === "image" ? (
                                <div className="-m-2 rounded-xl overflow-hidden mb-1">
                                  <img src={msg.content} alt="Photo" className="max-w-full rounded-xl" />
                                </div>
                              ) : (
                                <p className="text-[15px] whitespace-pre-wrap break-words">{msg.content}</p>
                              )}
                              
                              <div className={cn(
                                "flex items-center gap-1 mt-1 justify-end",
                                isMe ? "text-primary-foreground/70" : "text-muted-foreground"
                              )}>
                                <span className="text-[10px] font-medium">{new Date(msg.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>
                                {isMe && (
                                  <span className="text-[10px] tracking-tighter">
                                    {msg.isRead ? "✓✓" : "✓"}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                {/* Message Input */}
                <div className="p-3 sm:p-4 bg-card border-t border-border/50 z-10 flex items-end gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="rounded-full shrink-0 border-border/50 shadow-sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    <ImageIcon className="w-5 h-5 text-muted-foreground" />
                  </Button>
                  
                  <div className="flex-1 bg-muted/50 rounded-3xl border border-border/50 shadow-inner flex items-center px-4 overflow-hidden">
                    <textarea
                      placeholder="Type a message..."
                      className="w-full max-h-32 py-3 bg-transparent border-none focus:outline-none resize-none text-sm placeholder:text-muted-foreground scrollbar-hide flex items-center"
                      rows={1}
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      style={{ minHeight: "44px" }}
                    />
                  </div>
                  
                  <Button 
                    className="rounded-full shrink-0 w-11 h-11 shadow-md bg-primary hover:bg-primary/90" 
                    onClick={handleSendMessage}
                    disabled={!inputText.trim()}
                  >
                    <Send className="w-5 h-5 ml-0.5" />
                  </Button>
                </div>
              </>
            )}

            {/* Slide-over Info Panel */}
            {showInfo && activeUser && (
              <div className="absolute inset-y-0 right-0 w-full sm:w-80 bg-card border-l border-border/50 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right-full duration-300">
                <div className="h-16 border-b border-border/50 flex items-center justify-between px-4">
                  <h3 className="font-black text-lg">Chat Info</h3>
                  <Button variant="ghost" size="icon" onClick={() => setShowInfo(false)} className="rounded-full">
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="flex flex-col items-center text-center mb-8">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-orange-400 to-primary flex items-center justify-center font-black text-4xl text-white shadow-lg mb-4">
                      {activeUser.name[0].toUpperCase()}
                    </div>
                    <h2 className="text-xl font-bold">{activeUser.name}</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {activeUser.profile?.fitnessGoal || "Getting stronger"}
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start font-semibold rounded-xl" onClick={() => router.push(`/profile/${activeUser.id}`)}>
                      <Info className="w-4 h-4 mr-3 text-primary" /> View Profile
                    </Button>
                    <Button variant="outline" className="w-full justify-start font-semibold rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30" onClick={handleBlockUser}>
                      <AlertCircle className="w-4 h-4 mr-3" /> Block User
                    </Button>
                    <Button variant="outline" className="w-full justify-start font-semibold rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30" onClick={() => handleActionStub("Report User")}>
                      <MoreVertical className="w-4 h-4 mr-3" /> Report User
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
