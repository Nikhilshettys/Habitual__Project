"use client";

import { useState, useEffect } from "react";
import { AddHabitDialog } from "@/components/add-habit-dialog";
import { HabitCard } from "@/components/habit-card";
import type { Habit } from "@/lib/habits";
import { Target, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth-provider";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function DashboardPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const { user } = useAuth();
  
  // This effect will run once on mount to load habits for the logged-in user.
  // We will later replace this with a Firestore call.
  useEffect(() => {
    if (user) {
        try {
            const storedHabits = localStorage.getItem(`habits_${user.uid}`);
            if (storedHabits) {
                setHabits(JSON.parse(storedHabits));
            }
        } catch (error) {
            console.error("Failed to load habits from localStorage", error);
        }
    }
  }, [user]);

  // This effect saves habits to localStorage whenever they change.
  // We will also replace this with Firestore later.
  useEffect(() => {
    if (user) {
        try {
            localStorage.setItem(`habits_${user.uid}`, JSON.stringify(habits));
        } catch (error) {
            console.error("Failed to save habits to localStorage", error);
        }
    }
  }, [habits, user]);
  
  const handleLogout = async () => {
    try {
        await signOut(auth);
        // The AuthProvider will handle redirecting to the login page
    } catch(error) {
        console.error("Failed to log out", error);
    }
  };

  const handleAddHabit = (name: string) => {
    const newHabit: Habit = {
      id: crypto.randomUUID(),
      name,
      completions: [],
    };
    setHabits((prev) => [...prev, newHabit]);
  };

  const handleToggleComplete = (
    habitId: string,
    date: string,
    completed: boolean
  ) => {
    setHabits((prev) =>
      prev.map((habit) => {
        if (habit.id === habitId) {
          const newCompletions = completed
            ? [...habit.completions, date]
            : habit.completions.filter((d) => d !== date);
          const uniqueCompletions = [...new Set(newCompletions)].sort();
          return { ...habit, completions: uniqueCompletions };
        }
        return habit;
      })
    );
  };

  const handleDeleteHabit = (habitId: string) => {
    setHabits((prev) => prev.filter((habit) => habit.id !== habitId));
  };
  
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Target className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold font-headline">Habitual</h1>
          </div>
          <div className="flex items-center gap-4">
            <AddHabitDialog onAddHabit={handleAddHabit} />
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8">
        {habits.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {habits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                onToggleComplete={handleToggleComplete}
                onDelete={handleDeleteHabit}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 py-20 text-center">
            <h2 className="text-xl font-semibold">No habits yet!</h2>
            <p className="mt-2 text-muted-foreground">
              Click "Add New Habit" to start your journey.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
