'use server';
/**
 * @fileOverview An AI tool that generates marketing copy suggestions based on input keywords.
 *
 * - generateMarketingCopy - A function that handles the marketing copy generation process.
 * - AICopyResonanceInput - The input type for the generateMarketingCopy function.
 * - AICopyResonanceOutput - The return type for the generateMarketingCopy function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AICopyResonanceInputSchema = z.object({
  keywords: z
    .array(z.string())
    .describe('A list of conceptual keywords to base the marketing copy on.'),
});
export type AICopyResonanceInput = z.infer<typeof AICopyResonanceInputSchema>;

const AICopyResonanceOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe('A list of marketing copy suggestions generated based on the keywords.'),
});
export type AICopyResonanceOutput = z.infer<typeof AICopyResonanceOutputSchema>;

export async function generateMarketingCopy(
  input: AICopyResonanceInput
): Promise<AICopyResonanceOutput> {
  return aiCopyResonanceFlow(input);
}

const aiCopyResonancePrompt = ai.definePrompt({
  name: 'aiCopyResonancePrompt',
  input: { schema: AICopyResonanceInputSchema },
  output: { schema: AICopyResonanceOutputSchema },
  prompt: `You are an expert marketing copywriter for Mix Aura, a high-end digital agency specializing in digital marketing and web development.
Your goal is to generate compelling, powerful, and intelligent marketing copy that exudes dominance, creative power, and controlled chaos.
The primary color scheme uses deep matte black and electric neon purple.

Generate several marketing copy suggestions based on the following conceptual keywords:

Keywords: {{#each keywords}}- {{{this}}}
{{/each}}

Ensure the suggestions are evocative, impactful, and demonstrate technological mastery. The tone should be authoritative and cutting-edge.`,
});

const aiCopyResonanceFlow = ai.defineFlow(
  {
    name: 'aiCopyResonanceFlow',
    inputSchema: AICopyResonanceInputSchema,
    outputSchema: AICopyResonanceOutputSchema,
  },
  async (input) => {
    const { output } = await aiCopyResonancePrompt(input);
    return output!;
  }
);
