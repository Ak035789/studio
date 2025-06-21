'use server';
/**
 * @fileOverview AI agent to filter prompts for harmful content.
 *
 * - filterHarmfulPrompts - A function that filters the prompt for harmful content.
 * - FilterHarmfulPromptsInput - The input type for the filterHarmfulPrompts function.
 * - FilterHarmfulPromptsOutput - The return type for the filterHarmfulPrompts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FilterHarmfulPromptsInputSchema = z.object({
  prompt: z.string().describe('The prompt to filter for harmful content.'),
});
export type FilterHarmfulPromptsInput = z.infer<typeof FilterHarmfulPromptsInputSchema>;

const FilterHarmfulPromptsOutputSchema = z.object({
  isHarmful: z.boolean().describe('Whether the prompt is harmful or not.'),
  reason: z.string().optional().describe('The reason why the prompt is harmful.'),
});
export type FilterHarmfulPromptsOutput = z.infer<typeof FilterHarmfulPromptsOutputSchema>;

export async function filterHarmfulPrompts(input: FilterHarmfulPromptsInput): Promise<FilterHarmfulPromptsOutput> {
  return filterHarmfulPromptsFlow(input);
}

const filterHarmfulPromptsPrompt = ai.definePrompt({
  name: 'filterHarmfulPromptsPrompt',
  input: {schema: FilterHarmfulPromptsInputSchema},
  output: {schema: FilterHarmfulPromptsOutputSchema},
  prompt: `You are an AI content filter that determines if the given prompt is harmful or inappropriate.

  If the prompt contains harmful or inappropriate content, set isHarmful to true, and provide a reason.  Otherwise, set isHarmful to false.

  Prompt: {{{prompt}}}`,
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
});

const filterHarmfulPromptsFlow = ai.defineFlow(
  {
    name: 'filterHarmfulPromptsFlow',
    inputSchema: FilterHarmfulPromptsInputSchema,
    outputSchema: FilterHarmfulPromptsOutputSchema,
  },
  async input => {
    const {output} = await filterHarmfulPromptsPrompt(input);
    return output!;
  }
);
