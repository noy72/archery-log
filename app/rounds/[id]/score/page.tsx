import { redirect } from 'next/navigation';
import { fetchRound } from '@/lib/actions';
import ScoreInputClient from './ScoreInputClient';

interface ScorePageProps {
  params: { id: string };
}

export default async function ScorePage({ params }: ScorePageProps) {
  const round = await fetchRound(params.id);

  if (!round) {
    redirect('/rounds/new');
  }

  // 最初の空のエンドを見つける
  const firstEmptyEndIndex = round.ends.findIndex(end => end.scores.length === 0);
  if (firstEmptyEndIndex === -1) {
    // 全エンドが完了している場合は詳細ページに遷移
    redirect(`/rounds/${params.id}`);
  }

  return <ScoreInputClient initialRound={round} roundId={params.id} />;
}
