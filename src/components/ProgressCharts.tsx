"use client";

import React from "react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProgressChartsProps {
  strengthData: { date: string; est1RM: number; weight: number }[];
  volumeData: { date: string; volume: number; type: string }[];
  selectedExercise: string;
  setSelectedExercise: (val: string) => void;
  userExercises: { id: string; name: string }[];
}

export default function ProgressCharts({
  strengthData,
  volumeData,
  selectedExercise,
  setSelectedExercise,
  userExercises
}: ProgressChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Strength Progress Line Chart */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl font-bold">Strength Progress</CardTitle>
          <select 
            className="bg-muted text-foreground border border-border rounded-md px-3 py-1.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
            value={selectedExercise}
            onChange={(e) => setSelectedExercise(e.target.value)}
          >
            {userExercises.map(e => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>
        </CardHeader>
        <CardContent>
          {strengthData.length > 0 ? (
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={strengthData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis dataKey="date" stroke="#888" fontSize={12} tickMargin={10} />
                  <YAxis stroke="#888" fontSize={12} tickFormatter={(val) => `${val}kg`} width={50} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
                  />
                  <Line type="monotone" dataKey="weight" name="Max Weight (kg)" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="est1RM" name="Est. 1RM (kg)" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] w-full flex items-center justify-center text-muted-foreground">
              No data for this exercise yet.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Volume Bar Chart */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Training Volume (Last 14)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={volumeData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="date" stroke="#888" fontSize={12} tickMargin={10} />
                <YAxis stroke="#888" fontSize={12} tickFormatter={(val) => `${val/1000}k`} width={50} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                />
                <Bar dataKey="volume" name="Volume (kg)" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
