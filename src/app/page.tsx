import { Logo } from '@/components/logo';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-10 w-full border-b bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 max-w-7xl items-center px-4">
          <Logo />
        </div>
      </header>
      <main className="flex-1">
        {/* Blank canvas for future content */}
      </main>
    </div>
  );
}
