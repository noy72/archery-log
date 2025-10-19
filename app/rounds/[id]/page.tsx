import { redirect } from 'next/navigation';
import { fetchRound } from '@/lib/actions';
import RoundDetailClient from './RoundDetailClient';

export default async function RoundDetailPage({
  params,
}: {
  params: { id: string };
}) {
  // Server Side でラウンドデータを取得
  const round = await fetchRound(params.id);

  if (!round) {
    redirect('/rounds');
  }

  // Client Component にデータを渡す
  return <RoundDetailClient round={round} />;
}
