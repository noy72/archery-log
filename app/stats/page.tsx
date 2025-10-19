import Link from 'next/link';
import { fetchRounds } from '@/lib/actions';
import StatsClient from './StatsClient';

export default async function StatsPage() {
  const rounds = await fetchRounds();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">統計</h1>
          <Link href="/" className="text-sm text-blue-600 hover:text-blue-800">
            ホームに戻る
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StatsClient rounds={rounds} />
      </main>
    </div>
  );
}
