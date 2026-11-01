import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import Navbar from "@/components/Navbar";
import { cookies } from "next/headers";
import * as jwt from "jsonwebtoken";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, MapPin, DollarSign, Activity, Calendar, Dumbbell, MessageCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

async function getUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "super-secret") as any;
    return payload.userId as string;
  } catch {
    return null;
  }
}

function label(s: string) {
  if (!s) return "";
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default async function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const currentUserId = await getUserId();
  const resolvedParams = await params;
  const targetUserId = resolvedParams.id;

  const user = await prisma.user.findUnique({
    where: { id: targetUserId },
    include: { profile: true }
  });

  if (!user) {
    notFound();
  }

  const currentUser = currentUserId ? await prisma.user.findUnique({
    where: { id: currentUserId },
    select: { name: true }
  }) : null;

  const p = user.profile;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar userName={currentUser?.name?.split(" ")[0] || "Guest"} />
      
      <main className="flex-1 container mx-auto px-4 sm:px-8 py-10 max-w-3xl">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-10">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-tr from-orange-400 to-primary flex items-center justify-center font-black text-6xl text-white shadow-2xl shrink-0">
            {user.name[0].toUpperCase()}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl font-black tracking-tight mb-2">{user.name}</h1>
            {p && (
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                <Badge variant="secondary" className="text-sm px-3 py-1 bg-muted">{p.age} years</Badge>
                <Badge variant="secondary" className="text-sm px-3 py-1 bg-muted">{label(p.gender)}</Badge>
                {p.preferredLocation && <Badge variant="outline" className="text-sm px-3 py-1"><MapPin className="w-3 h-3 mr-1" /> {p.preferredLocation}</Badge>}
              </div>
            )}
            
            {currentUserId && currentUserId !== user.id && (
              <div className="flex justify-center md:justify-start gap-3 mt-6">
                <Link href={`/messages?userId=${user.id}`}>
                  <Button className="font-bold rounded-full px-6 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg">
                    <MessageCircle className="w-5 h-5 mr-2" /> Message
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {p ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-border/50 shadow-sm bg-card/50 backdrop-blur">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" /> Fitness Goals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground font-semibold mb-1">Primary Goal</p>
                  <p className="font-medium">{label(p.fitnessGoal)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-semibold mb-1">Current Level</p>
                  <p className="font-medium">{label(p.fitnessLevel)}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm bg-card/50 backdrop-blur">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" /> Schedule & Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground font-semibold mb-1">Preferred Time</p>
                  <p className="font-medium">{label(p.workoutTime)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-semibold mb-1">Frequency</p>
                  <p className="font-medium">{label(p.workoutDays)}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm bg-card/50 backdrop-blur md:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Dumbbell className="w-5 h-5 text-primary" /> About {user.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {p.bio && (
                  <div>
                    <p className="text-sm text-muted-foreground font-semibold mb-2">Bio</p>
                    <p className="text-foreground leading-relaxed italic border-l-4 border-primary/30 pl-4 py-1">
                      "{p.bio}"
                    </p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground font-semibold mb-1">Height</p>
                    <p className="font-medium">{p.height} cm</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground font-semibold mb-1">Weight</p>
                    <p className="font-medium">{p.weight} kg</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground font-semibold mb-1">Languages</p>
                    <p className="font-medium">{p.languages || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground font-semibold mb-1">Gym Type</p>
                    <p className="font-medium">{label(p.preferredGymType)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="border-dashed border-2 bg-transparent text-center p-12">
            <CardContent className="text-muted-foreground">
              <p className="text-lg font-semibold mb-2">Profile Incomplete</p>
              <p>{user.name} hasn't set up their fitness profile yet.</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
