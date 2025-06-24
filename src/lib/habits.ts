import { differenceInCalendarDays, parseISO, startOfToday, format, subDays, isSameDay } from 'date-fns';

export type Habit = {
  id: string;
  name: string;
  completions: string[]; // Dates in 'yyyy-MM-dd' format
};

export const getTodayDateString = (): string => {
  return format(new Date(), 'yyyy-MM-dd');
};

export const calculateStreak = (completions: string[]): number => {
  if (completions.length === 0) {
    return 0;
  }

  const sortedDates = completions.map(c => parseISO(c)).sort((a, b) => b.getTime() - a.getTime());
  
  const today = startOfToday();
  const mostRecentCompletion = sortedDates[0];

  if (!mostRecentCompletion) {
    return 0;
  }
  
  const daysDiffFromToday = differenceInCalendarDays(today, mostRecentCompletion);

  if (daysDiffFromToday > 1) {
    return 0; // Streak is broken
  }

  let streak = 1;
  let lastDate = mostRecentCompletion;

  for (let i = 1; i < sortedDates.length; i++) {
    const currentDate = sortedDates[i];
    if (differenceInCalendarDays(lastDate, currentDate) === 1) {
      streak++;
      lastDate = currentDate;
    } else if (differenceInCalendarDays(lastDate, currentDate) > 1) {
      break; // Gap in dates, streak ends
    }
    // If difference is 0, it's a duplicate entry for the same day, so we just continue.
  }

  return streak;
};

export const get7DayHistory = (completions: string[]): { date: string; day: string; completed: number }[] => {
  const today = startOfToday();
  const history = [];

  for (let i = 6; i >= 0; i--) {
    const date = subDays(today, i);
    const dateString = format(date, 'yyyy-MM-dd');
    const dayName = format(date, 'eee'); // e.g., 'Mon'
    
    const isCompleted = completions.some(completionDateStr => {
      return isSameDay(parseISO(completionDateStr), date);
    });

    history.push({
      date: dateString,
      day: dayName,
      completed: isCompleted ? 1 : 0,
    });
  }

  return history;
};
