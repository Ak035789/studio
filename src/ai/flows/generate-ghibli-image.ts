// src/ai/flows/generate-ghibli-image.ts
'use server';

/**
 * @fileOverview Generates Studio Ghibli-style images based on a text prompt.
 *
 * - generateGhibliImage - A function that generates a Studio Ghibli-style image from a text prompt.
 * - GenerateGhibliImageInput - The input type for the generateGhibliImage function.
 * - GenerateGhibliImageOutput - The return type for the generateGhibliImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';

const GenerateGhibliImageInputSchema = z.object({
  prompt: z.string().describe('The text prompt to generate the image from.'),
  image: z.string().optional().describe(
    "An image to use as inspiration, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
  ),
});

export type GenerateGhibliImageInput = z.infer<typeof GenerateGhibliImageInputSchema>;

const GenerateGhibliImageOutputSchema = z.object({
  image: z.string().describe('The generated Studio Ghibli-style image as a data URI.'),
});

export type GenerateGhibliImageOutput = z.infer<typeof GenerateGhibliImageOutputSchema>;

export async function generateGhibliImage(input: GenerateGhibliImageInput): Promise<GenerateGhibliImageOutput> {
  return generateGhibliImageFlow(input);
}

const generateGhibliImageFlow = ai.defineFlow(
  {
    name: 'generateGhibliImageFlow',
    inputSchema: GenerateGhibliImageInputSchema,
    outputSchema: GenerateGhibliImageOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: input.image ? [{media: {url: input.image}}, {text: input.prompt}] : input.prompt,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media) {
      throw new Error('No image was generated.');
    }

    return {image: media.url};
  }
);
