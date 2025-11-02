import { fetchRounds } from '@/lib/actions';
import { getCurrentUser } from '@/lib/auth';
import Header from '@/components/Header';
import StatsClient from './StatsClient';

export const dynamic = 'force-dynamic';

export default async function StatsPage() {
  const rounds = await fetchRounds();
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="統計" user={user || undefined} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StatsClient rounds={rounds} />
      </main>
    </div>
  );
}
