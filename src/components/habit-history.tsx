"use client";

import { Calendar } from "@/components/ui/calendar";
import { parseISO } from "date-fns";
import { useMemo } from "react";

type HabitHistoryProps = {
  completions: string[]; // Dates in 'yyyy-MM-dd' format
};

export function HabitHistory({ completions }: HabitHistoryProps) {
  const completedDates = useMemo(() => {
    return completions.map((dateStr) => parseISO(dateStr));
  }, [completions]);

  return (
    <div className="flex justify-center rounded-md border bg-muted/30">
      <Calendar
        month={new Date()}
        modifiers={{ 
          completed: completedDates,
          today: new Date(),
        }}
        modifiersClassNames={{
            completed: 'bg-accent text-accent-foreground rounded-md',
            today: 'bg-primary/50 text-primary-foreground rounded-md'
        }}
        showOutsideDays={true}
        className="p-2"
        disableNavigation
        classNames={{
            day: "h-8 w-8 rounded-md",
            head_cell: "w-8",
            cell: "w-8"
        }}
      />
    </div>
  );
}
