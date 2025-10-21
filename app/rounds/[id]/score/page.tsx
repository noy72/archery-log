import { redirect } from 'next/navigation';
import { fetchRound } from '@/lib/actions';
import { getCurrentUser } from '@/lib/auth';
import Header from '@/components/Header';
import ScoreInputClient from './ScoreInputClient';

interface ScorePageProps {
  params: { id: string };
}

export default async function ScorePage({ params }: ScorePageProps) {
  const round = await fetchRound(params.id);
  const user = await getCurrentUser();

  if (!round) {
    redirect('/rounds/new');
  }

  const firstEmptyEndIndex = round.ends.findIndex(end => end.scores.length === 0);
  if (firstEmptyEndIndex === -1) {
    redirect(`/rounds/${params.id}`);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="点数入力" user={user || undefined} />
      <ScoreInputClient initialRound={round} roundId={params.id} />
    </div>
  );
}
