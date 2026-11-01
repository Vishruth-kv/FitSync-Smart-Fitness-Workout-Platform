"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Users, MapPin, Target, Sparkles, Brain } from "lucide-react";

export default function Home() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-br from-primary/20 via-background to-background rounded-full blur-[100px] -z-10 opacity-50" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-tl from-brand-orange/10 via-background to-background rounded-full blur-[100px] -z-10 opacity-50" />

      {/* Navbar */}
      <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl transition-all">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="text-2xl font-black tracking-tighter">
              Fit<span className="text-primary">Match</span>
              <span className="text-secondary ml-1 text-xs tracking-widest uppercase align-top">AI</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Log in
            </Link>
            <Button asChild className="rounded-full font-semibold shadow-lg shadow-primary/20">
              <Link href="/signup">Get Started Free</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="container mx-auto px-4 sm:px-8 py-24 md:py-32 flex flex-col items-center text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/10 text-primary text-xs font-bold tracking-wide uppercase mb-8"
          >
            <Sparkles className="h-4 w-4" />
            AI-Powered Gym Partner Matching
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-black tracking-tighter max-w-4xl leading-[1.1] mb-6"
          >
            Find Your Perfect <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-brand-orange">
              Gym Partner
            </span> with AI
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed"
          >
            Match with people who share your goals, schedule, location, and fitness level. Every match is scored 0–100 with full reasons explained.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 w-full justify-center"
          >
            <Button asChild size="lg" className="rounded-full h-14 px-8 text-lg shadow-xl shadow-primary/20 hover:scale-105 transition-transform">
              <Link href="/signup">Find My Partner &rarr;</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full h-14 px-8 text-lg border-2 hover:bg-muted/50">
              <Link href="/login">Explore AI Coach</Link>
            </Button>
          </motion.div>
        </section>

        {/* Features Grid */}
        <section className="bg-muted/30 py-24 border-y border-border/50">
          <div className="container mx-auto px-4 sm:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">The Matching Formula</h2>
              <p className="text-muted-foreground text-lg">Every score is a weighted combination of these factors</p>
            </div>
            
            <motion.div 
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-100px" }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto"
            >
              {[
                { icon: Target, title: "Fitness Goal", desc: "Same goal = biggest driver of compatibility", score: "30%" },
                { icon: Activity, title: "Routine & Schedule", desc: "Workout time + overlapping training days", score: "20%" },
                { icon: MapPin, title: "Location", desc: "Same area or gym neighborhood", score: "20%" },
                { icon: Brain, title: "Fitness Level", desc: "Beginner / Intermediate / Advanced alignment", score: "15%" },
                { icon: Users, title: "Personality", desc: "Introvert / Extrovert compatibility", score: "5%" },
                { icon: Sparkles, title: "Budget & Extras", desc: "Similar monthly gym spend and habits", score: "10%" }
              ].map((f, i) => (
                <motion.div key={i} variants={item}>
                  <Card className="bg-background/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-colors h-full">
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <div className="p-3 bg-primary/10 text-primary rounded-xl">
                          <f.icon className="h-6 w-6" />
                        </div>
                        <span className="text-2xl font-black text-muted-foreground/30">{f.score}</span>
                      </div>
                      <CardTitle className="text-xl">{f.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base">{f.desc}</CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-4 sm:px-8 py-32 text-center">
          <h2 className="text-4xl font-extrabold tracking-tight mb-6">Ready to find your partner?</h2>
          <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto">Create your profile in 2 minutes. Get matched. Train together. It&apos;s completely free to get started.</p>
          <Button asChild size="lg" className="rounded-full h-14 px-10 text-lg shadow-xl shadow-primary/20">
            <Link href="/signup">Start Matching Now &rarr;</Link>
          </Button>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-10 text-center text-muted-foreground text-sm">
        <div className="container mx-auto px-4">
          <p>&copy; {new Date().getFullYear()} FitMatch AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
