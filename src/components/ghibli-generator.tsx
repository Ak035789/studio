
'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { Download, Sparkles, Image as ImageIcon, Square, RectangleVertical, RectangleHorizontal } from 'lucide-react';

import { generateImageAction, type FormState } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Skeleton } from '@/components/ui/skeleton';

const initialState: FormState = {
  message: null,
  image: null,
  errors: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full" size="lg">
      <Sparkles className="mr-2 h-5 w-5" />
      {pending ? 'Generating...' : 'Generate Image'}
    </Button>
  );
}

const aspectRatios = [
  { value: '1:1', label: 'Square', icon: Square },
  { value: '9:16', label: 'Portrait', icon: RectangleVertical },
  { value: '16:9', label: 'Landscape', icon: RectangleHorizontal },
] as const;

export function GhibliGenerator() {
  const [state, formAction] = useFormState(generateImageAction, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<'1:1' | '9:16' | '16:9'>('1:1');

  useEffect(() => {
    if (state.message && state.message !== 'Image generated successfully.') {
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: state.message,
      });
    }
    if (state.message === 'Image generated successfully.') {
        toast({
            title: 'Success!',
            description: 'Your magical artwork has been generated.',
        });
        formRef.current?.reset();
    }
  }, [state, toast]);

  const handleDownload = () => {
    if (!state.image) return;
    const link = document.createElement('a');
    link.href = state.image;
    link.download = `ghibli-gen-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
      <Card className="lg:col-span-2 w-full">
        <CardHeader>
          <CardTitle>Create your scene</CardTitle>
          <CardDescription>
            Describe the scene you want to create. Be as descriptive as you like!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form ref={formRef} action={formAction} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="prompt">Your Prompt</Label>
              <Textarea
                id="prompt"
                name="prompt"
                placeholder="e.g., A girl with a straw hat in a field of flowers, watching a train pass by on a sunny day."
                className="min-h-[120px]"
                required
              />
              {state.errors?.prompt && <p className="text-sm font-medium text-destructive">{state.errors.prompt[0]}</p>}
            </div>

            <div className="space-y-3">
              <Label>Aspect Ratio</Label>
              <RadioGroup
                name="aspectRatio"
                defaultValue={selectedAspectRatio}
                onValueChange={(value: '1:1' | '9:16' | '16:9') => setSelectedAspectRatio(value)}
                className="grid grid-cols-3 gap-4"
              >
                {aspectRatios.map(({ value, label, icon: Icon }) => (
                  <div key={value}>
                    <RadioGroupItem value={value} id={value} className="peer sr-only" />
                    <Label
                      htmlFor={value}
                      className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent/50 hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-colors"
                    >
                      <Icon className="mb-2 h-6 w-6" />
                      {label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            
            <SubmitButton />
          </form>
        </CardContent>
      </Card>

      <div className="lg:col-span-3">
        <Card className="w-full h-auto aspect-square"
            style={{ 
                aspectRatio: selectedAspectRatio.replace(':', ' / ')
            }}
        >
          <CardContent className="p-0 h-full">
            <div className="relative w-full h-full flex flex-col items-center justify-center bg-muted/30 rounded-lg overflow-hidden">
              <ImageDisplay imageUrl={state.image} selectedAspectRatio={selectedAspectRatio} />
            </div>
          </CardContent>
        </Card>
         {state.image && (
          <div className="mt-4 flex justify-center">
            <Button onClick={handleDownload} variant="secondary">
              <Download className="mr-2 h-4 w-4" />
              Download Image
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}


function ImageDisplay({ imageUrl, selectedAspectRatio }: { imageUrl: string | null, selectedAspectRatio: string }) {
    const { pending } = useFormStatus();

    const aspectRatioClass = {
        '1:1': 'aspect-square',
        '9:16': 'aspect-[9/16]',
        '16:9': 'aspect-[16/9]',
    }[selectedAspectRatio] || 'aspect-square';

    if (pending) {
        return <Skeleton className={`w-full h-full ${aspectRatioClass}`} />;
    }

    if (imageUrl) {
        return <Image src={imageUrl} alt="Generated Ghibli-style image" fill className="object-cover" data-ai-hint="anime art" />;
    }

    return (
        <div className="text-center text-muted-foreground p-8">
            <ImageIcon className="mx-auto h-12 w-12 mb-4" />
            <p className="font-medium">Your magical creation will appear here</p>
            <p className="text-sm">Fill out the form to start generating</p>
        </div>
    );
}
