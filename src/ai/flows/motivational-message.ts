'use server';

/**
 * @fileOverview AI flow for generating motivational messages based on habit tracking history.
 *
 * - generateMotivationalMessage - A function that generates a motivational message.
 * - MotivationalMessageInput - The input type for the generateMotivationalMessage function.
 * - MotivationalMessageOutput - The return type for the generateMotivationalMessage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MotivationalMessageInputSchema = z.object({
  habitName: z.string().describe('The name of the habit being tracked.'),
  completionHistory: z
    .string()
    .describe(
      'A comma separated list of dates (YYYY-MM-DD) when the habit was completed.'
    ),
  streakLength: z
    .number()
    .describe(
      'The length of the current streak of consecutive days the habit has been completed.'
    ),
});
export type MotivationalMessageInput = z.infer<
  typeof MotivationalMessageInputSchema
>;

const MotivationalMessageOutputSchema = z.object({
  message: z.string().describe('The personalized motivational message.'),
});
export type MotivationalMessageOutput = z.infer<
  typeof MotivationalMessageOutputSchema
>;

export async function generateMotivationalMessage(
  input: MotivationalMessageInput
): Promise<MotivationalMessageOutput> {
  return motivationalMessageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'motivationalMessagePrompt',
  input: {schema: MotivationalMessageInputSchema},
  output: {schema: MotivationalMessageOutputSchema},
  prompt: `You are a motivational coach. You will generate a personalized
motivational message based on the user's habit tracking history.

Habit Name: {{{habitName}}}
Completion History: {{{completionHistory}}}
Streak Length: {{{streakLength}}}

Generate a motivational message to encourage the user to continue tracking
their habit. If the user has a streak, encourage them to keep the streak
going. The message should be no more than 2 sentences.
`,
});

const motivationalMessageFlow = ai.defineFlow(
  {
    name: 'motivationalMessageFlow',
    inputSchema: MotivationalMessageInputSchema,
    outputSchema: MotivationalMessageOutputSchema,
    retries: 3,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
