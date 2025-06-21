import { GhibliGenerator } from '@/components/ghibli-generator';
import { Palette } from 'lucide-react';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 md:p-12 transition-colors duration-300">
      <div className="w-full max-w-6xl mx-auto">
        <header className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center justify-center bg-primary/20 rounded-full p-3 mb-4">
            <Palette className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-headline font-bold text-foreground mb-2">
            GhibliGen
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Bring your imagination to life. Describe a scene and we&apos;ll create a magical, Studio Ghibli-inspired artwork for you.
          </p>
        </header>
        <GhibliGenerator />
      </div>
    </main>
  );
}
