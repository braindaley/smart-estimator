import { Header } from "@/components/header";

export default function ApplyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex flex-1 items-center justify-center">
        <div className="container mx-auto max-w-7xl px-4 text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Apply Now
          </h1>
          <p className="mb-8 text-lg text-muted-foreground sm:text-xl">
            This is the placeholder page for "Apply".
          </p>
        </div>
      </main>
    </div>
  );
}
