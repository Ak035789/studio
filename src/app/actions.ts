
'use server';

import { z } from 'zod';
import { filterHarmfulPrompts } from '@/ai/flows/filter-harmful-prompts';
import { generateGhibliImage } from '@/ai/flows/generate-ghibli-image';

const formSchema = z.object({
  prompt: z.string().min(10, { message: 'Please enter a prompt with at least 10 characters.' }).max(1000, { message: 'Prompt must be 1000 characters or less.' }),
  aspectRatio: z.enum(['1:1', '9:16', '16:9']),
});

export type FormState = {
  message: string | null;
  image: string | null;
  errors?: {
    prompt?: string[];
    aspectRatio?: string[];
  } | null;
};

export async function generateImageAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = formSchema.safeParse({
    prompt: formData.get('prompt'),
    aspectRatio: formData.get('aspectRatio'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Invalid form data.',
      errors: validatedFields.error.flatten().fieldErrors,
      image: null,
    };
  }

  const { prompt, aspectRatio } = validatedFields.data;

  try {
    const harmfulCheck = await filterHarmfulPrompts({ prompt });

    if (harmfulCheck.isHarmful) {
      return {
        message: `Your prompt was flagged for: ${harmfulCheck.reason || 'inappropriate content'}. Please try again with a different prompt.`,
        errors: null,
        image: null,
      };
    }

    const fullPrompt = `${prompt}, in the style of Studio Ghibli, professional anime illustration, cinematic lighting, ${aspectRatio} aspect ratio`;

    const result = await generateGhibliImage({ prompt: fullPrompt });
    
    if (!result.image) {
        throw new Error("Image generation failed to return an image.");
    }

    return {
      message: 'Image generated successfully.',
      errors: null,
      image: result.image,
    };
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return {
      message: `An error occurred during image generation: ${errorMessage}. Please try again.`,
      errors: null,
      image: null,
    };
  }
}
