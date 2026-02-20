import { DocflowDashboard } from '@/components/docflow/DocflowDashboard';
import { Header } from '@/components/docflow/Header';

export default function Home() {
  return (
    <div className="flex flex-col h-screen bg-background">
      <Header />
      <main className="flex-1 overflow-auto">
        <DocflowDashboard />
      </main>
    </div>
  );
}
