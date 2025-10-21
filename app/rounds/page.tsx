import Link from 'next/link';
import { fetchRounds } from '@/lib/actions';
import { getCurrentUser } from '@/lib/auth';
import { Round } from '@/lib/types';
import Header from '@/components/Header';

export default async function RoundsPage() {
  const rounds = await fetchRounds();
  const user = await getCurrentUser();

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const isRoundComplete = (round: Round) => {
    return round.ends.every((end) => end.scores.length > 0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="記録履歴" user={user || undefined} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {rounds.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">記録がありません</h3>
            <p className="mt-2 text-sm text-gray-500">新しいラウンドを開始して記録を作成しましょう</p>
            <div className="mt-6">
              <Link
                href="/rounds/new"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                新しい記録を開始
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {rounds.map((round) => {
              const isComplete = isRoundComplete(round);
              const completedEnds = round.ends.filter((end) => end.scores.length > 0).length;

              return (
                <div key={round.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {round.distance}m ラウンド
                        </h3>
                        <span className="text-sm text-gray-500">
                          {round.endsCount}エンド × {round.arrowsPerEnd}射
                        </span>
                        {!isComplete && (
                          <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded">
                            進行中 ({completedEnds}/{round.endsCount})
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>{formatDate(round.date)}</div>
                        {round.location && <div>📍 {round.location}</div>}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-blue-600">{round.totalScore}</div>
                      <div className="text-sm text-gray-500">平均: {round.averageScore.toFixed(2)}</div>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Link
                      href={`/rounds/${round.id}`}
                      className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-center font-medium text-gray-700 hover:bg-gray-50"
                    >
                      詳細を見る
                    </Link>
                    {!isComplete && (
                      <Link
                        href={`/rounds/${round.id}/score`}
                        className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg text-center font-medium hover:bg-blue-700"
                      >
                        記録を続ける
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
