import { DocflowLogo } from '@/components/icons/DocflowLogo';

export function Header() {
  return (
    <header className="flex items-center h-16 px-4 sm:px-6 border-b bg-card">
      <div className="flex items-center gap-3">
        <DocflowLogo className="h-8 w-8 text-primary" />
        <h1 className="text-xl font-bold font-headline text-foreground">
          DocFlow
        </h1>
      </div>
    </header>
  );
}
