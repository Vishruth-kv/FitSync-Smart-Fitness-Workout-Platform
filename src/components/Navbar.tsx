"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Sparkles, LayoutDashboard, Users, Brain, User, LogOut, Activity, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/progress", label: "Progress", icon: Activity },
  { href: "/form-check", label: "Form Check", icon: Sparkles },
  { href: "/matches", label: "My Matches", icon: Users },
  { href: "/messages", label: "Messages", icon: MessageCircle },
  { href: "/coach", label: "AI Coach", icon: Brain },
  { href: "/profile", label: "Profile", icon: User },
];

export default function Navbar({ userName }: { userName: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await fetch("/api/messages/unread");
        if (res.ok) {
          const data = await res.json();
          setUnreadCount(data.count || 0);
        }
      } catch (e) {}
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 15000);
    return () => clearInterval(interval);
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl h-16 flex items-center justify-between px-4 sm:px-8">
      <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
        <Sparkles className="h-5 w-5 text-primary" />
        <span className="text-xl font-black tracking-tighter">
          Fit<span className="text-primary">Match</span>
        </span>
      </Link>
      
      <div className="hidden md:flex items-center gap-1">
        {links.map(l => (
          <Link 
            key={l.href} 
            href={l.href} 
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all relative",
              pathname === l.href 
                ? "bg-primary/10 text-primary shadow-sm" 
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <l.icon className="w-4 h-4" />
            {l.label}
            {l.href === "/messages" && unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </Link>
        ))}
      </div>
      
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-muted-foreground hidden sm:inline-block">
          👋 <span className="font-bold text-foreground">{userName}</span>
        </span>
        <Button onClick={logout} variant="outline" size="sm" className="rounded-full font-semibold border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30">
          <LogOut className="w-4 h-4 mr-2" />
          Log out
        </Button>
      </div>
    </nav>
  );
}
