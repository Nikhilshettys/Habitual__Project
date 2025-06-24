"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { type Habit, getTodayDateString, calculateStreak } from "@/lib/habits";
import { HabitProgressChart } from "./habit-progress-chart";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Lightbulb, LoaderCircle, Trash2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { generateMotivationalMessage } from "@/ai/flows/motivational-message";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type HabitCardProps = {
  habit: Habit;
  onToggleComplete: (habitId: string, date: string, completed: boolean) => void;
  onDelete: (habitId: string) => void;
};

export function HabitCard({ habit, onToggleComplete, onDelete }: HabitCardProps) {
  const todayStr = getTodayDateString();
  const isCompletedToday = habit.completions.includes(todayStr);

  const [motivation, setMotivation] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleGetMotivation = async () => {
    setIsLoading(true);
    setMotivation("");
    try {
      const streak = calculateStreak(habit.completions);
      const result = await generateMotivationalMessage({
        habitName: habit.name,
        completionHistory: habit.completions.join(","),
        streakLength: streak,
      });
      setMotivation(result.message);
    } catch (error) {
      console.error("Failed to get motivation:", error);
      setMotivation("Couldn't get a motivational message. Keep trying!");
    } finally {
      setIsLoading(false);
    }
  };

  const streak = calculateStreak(habit.completions);

  return (
    <Card className="flex flex-col shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <div className="flex justify-between items-start">
            <div className="pr-2">
                <CardTitle className="font-headline">{habit.name}</CardTitle>
                <CardDescription>
                    {streak > 0 ? `Current streak: ${streak} day${streak > 1 ? 's' : ''}` : "No current streak. Let's start one!"}
                </CardDescription>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete the habit "{habit.name}" and all its history. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(habit.id)}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <div className="flex items-center space-x-2 rounded-md border p-3"
             style={{ animation: isCompletedToday ? 'complete-animation 0.5s ease-out' : 'none' }}>
          <Checkbox
            id={`complete-${habit.id}`}
            checked={isCompletedToday}
            onCheckedChange={(checked) => {
              onToggleComplete(habit.id, todayStr, !!checked);
            }}
            aria-label={`Mark ${habit.name} as complete for today`}
          />
          <label
            htmlFor={`complete-${habit.id}`}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Mark as complete for today
          </label>
        </div>
        <HabitProgressChart completions={habit.completions} />
      </CardContent>
      <CardFooter>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full" onClick={handleGetMotivation}>
              {isLoading ? (
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Lightbulb className="mr-2 h-4 w-4" />
              )}
              Get Motivation
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 text-sm">
            {isLoading ? 'Thinking of something inspiring...' : motivation || 'Click "Get Motivation" for a boost!'}
          </PopoverContent>
        </Popover>
      </CardFooter>
    </Card>
  );
}
