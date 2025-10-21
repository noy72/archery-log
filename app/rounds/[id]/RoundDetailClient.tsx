'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Round } from '@/lib/types';
import { removeRound } from './actions';

interface RoundDetailClientProps {
  round: Round;
}

export default function RoundDetailClient({ round }: RoundDetailClientProps) {
  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteButton, setShowDeleteButton] = useState(false);

  const handleDelete = async () => {
    try {
      await removeRound(round.id);
      router.push('/rounds');
    } catch (error) {
      console.error('Failed to delete round:', error);
      alert('記録の削除に失敗しました');
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const isRoundComplete = round.ends.every(end => end.scores.length > 0);

  return (
    <>
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setShowDeleteButton(!showDeleteButton)}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            ⋮
          </button>
          {showDeleteButton && (
            <div className="absolute mt-8 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
              <button
                onClick={() => {
                  setShowDeleteButton(false);
                  setShowDeleteConfirm(true);
                }}
                className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
              >
                削除
              </button>
            </div>
          )}
        </div>
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">ラウンド情報</h2>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-600">距離</dt>
                  <dd className="font-medium">{round.distance}m</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">エンド数</dt>
                  <dd className="font-medium">{round.endsCount}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">1エンドあたりの射数</dt>
                  <dd className="font-medium">{round.arrowsPerEnd}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">日時</dt>
                  <dd className="font-medium">{formatDate(round.date)}</dd>
                </div>
                {round.location && (
                  <div className="flex justify-between">
                    <dt className="text-gray-600">場所</dt>
                    <dd className="font-medium">{round.location}</dd>
                  </div>
                )}
              </dl>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">スコア</h2>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-600">合計得点</div>
                  <div className="text-4xl font-bold text-blue-600">{round.totalScore}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">平均点</div>
                  <div className="text-2xl font-bold text-green-600">
                    {round.averageScore.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {round.memo && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-sm font-medium text-gray-700 mb-2">メモ</h3>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{round.memo}</p>
            </div>
          )}

          {!isRoundComplete && (
            <div className="mt-6 pt-6 border-t">
              <Link
                href={`/rounds/${round.id}/score`}
                className="block w-full py-3 px-4 bg-blue-600 text-white rounded-lg text-center font-medium hover:bg-blue-700"
              >
                記録を続ける
              </Link>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">エンド詳細</h2>
          <div className="space-y-6">
            {round.ends.map((end) => (
              <div key={end.endNumber} className="border-b pb-6 last:border-b-0">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-gray-900">第 {end.endNumber} エンド</h3>
                  <span className="text-lg font-bold text-blue-600">{end.total} 点</span>
                </div>
                <div className="grid grid-cols-6 gap-2">
                  {end.scores.map((score, i) => (
                    <div
                      key={i}
                      className={`h-12 flex flex-col items-center justify-center rounded-lg border-2 ${
                        score.value === 'X'
                          ? 'bg-yellow-50 border-yellow-500 text-yellow-700'
                          : score.numericValue >= 9
                          ? 'bg-blue-50 border-blue-500 text-blue-700'
                          : score.value === 'M'
                          ? 'bg-gray-100 border-gray-400 text-gray-600'
                          : 'bg-green-50 border-green-500 text-green-700'
                      }`}
                    >
                      <div className="text-lg font-bold">{score.displayValue}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">記録を削除</h3>
            <p className="text-sm text-gray-600 mb-6">
              この記録を削除してもよろしいですか？この操作は取り消せません。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                キャンセル
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                削除
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
