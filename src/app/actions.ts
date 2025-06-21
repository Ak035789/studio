
'use server';

import { z } from 'zod';
import { filterHarmfulPrompts } from '@/ai/flows/filter-harmful-prompts';
import { generateGhibliImage } from '@/ai/flows/generate-ghibli-image';

const formSchema = z.object({
  prompt: z.string().max(1000, { message: 'Prompt must be 1000 characters or less.' }).optional(),
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
  const imageFile = formData.get('image') as File | null;

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
  
  if (!prompt && (!imageFile || imageFile.size === 0)) {
    return {
      message: 'Please provide a prompt or an image.',
      errors: { prompt: ['Please enter a prompt or upload an image.'] },
      image: null,
    };
  }

  try {
    if (prompt) {
      const harmfulCheck = await filterHarmfulPrompts({ prompt });

      if (harmfulCheck.isHarmful) {
        return {
          message: `Your prompt was flagged for: ${harmfulCheck.reason || 'inappropriate content'}. Please try again with a different prompt.`,
          errors: null,
          image: null,
        };
      }
    }

    let imageDataUri: string | undefined;
    if (imageFile && imageFile.size > 0) {
        const buffer = Buffer.from(await imageFile.arrayBuffer());
        imageDataUri = `data:${imageFile.type};base64,${buffer.toString('base64')}`;
    }

    const basePrompt = prompt || "Transform this image into a Studio Ghibli style artwork.";
    const fullPrompt = `${basePrompt}, in the style of Studio Ghibli, professional anime illustration, cinematic lighting, ${aspectRatio} aspect ratio`;

    const result = await generateGhibliImage({ prompt: fullPrompt, image: imageDataUri });
    
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
