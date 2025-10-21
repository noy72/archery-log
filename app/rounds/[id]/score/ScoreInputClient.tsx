'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Score, End, Round } from '@/lib/types';
import { modifyRound } from './actions';

interface ScoreInputClientProps {
  initialRound: Round;
  roundId: string;
}

export default function ScoreInputClient({ initialRound, roundId }: ScoreInputClientProps) {
  const router = useRouter();
  const [round, setRound] = useState<Round>(initialRound);
  const [currentEndIndex, setCurrentEndIndex] = useState(() => {
    const firstEmptyEndIndex = initialRound.ends.findIndex(end => end.scores.length === 0);
    return firstEmptyEndIndex !== -1 ? firstEmptyEndIndex : 0;
  });
  const [currentScores, setCurrentScores] = useState<Score[]>([]);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);

  const createScore = (value: number | 'M' | 'X'): Score => {
    return {
      value,
      displayValue: value === 'M' ? 'M' : value === 'X' ? 'X' : value.toString(),
      numericValue: value === 'M' ? 0 : value === 'X' ? 10 : value,
    };
  };

  const handleScoreInput = async (value: number | 'M' | 'X') => {
    if (currentScores.length >= round.arrowsPerEnd) return;

    const newScores = [...currentScores, createScore(value)];
    setCurrentScores(newScores);

    if (newScores.length === round.arrowsPerEnd) {
      const total = newScores.reduce((sum, s) => sum + s.numericValue, 0);
      const updatedEnd: End = {
        endNumber: currentEndIndex + 1,
        scores: newScores,
        total,
      };

      const updatedEnds = [...round.ends];
      updatedEnds[currentEndIndex] = updatedEnd;

      const completedEnds = updatedEnds.filter(end => end.scores.length > 0);
      const totalScore = completedEnds.reduce((sum, end) => sum + end.total, 0);
      const totalArrows = completedEnds.reduce((sum, end) => sum + end.scores.length, 0);
      const averageScore = totalArrows > 0 ? totalScore / totalArrows : 0;

      try {
        await modifyRound(roundId, {
          ends: updatedEnds,
          totalScore,
          averageScore,
          updatedAt: new Date(),
        });

        setRound({
          ...round,
          ends: updatedEnds,
          totalScore,
          averageScore,
        });
        setCurrentScores([]);

        if (currentEndIndex + 1 >= round.endsCount) {
          router.push(`/rounds/${roundId}`);
        } else {
          setCurrentEndIndex(currentEndIndex + 1);
        }
      } catch (error) {
        console.error('Failed to save score:', error);
        alert('スコアの保存に失敗しました');
      }
    }
  };

  const handleUndo = async () => {
    if (currentScores.length > 0) {
      setCurrentScores(currentScores.slice(0, -1));
    } else if (currentEndIndex > 0) {
      const previousEndIndex = currentEndIndex - 1;
      const previousEnd = round.ends[previousEndIndex];

      const updatedEnds = [...round.ends];
      updatedEnds[previousEndIndex] = {
        endNumber: previousEndIndex + 1,
        scores: [],
        total: 0,
      };

      const completedEnds = updatedEnds.filter(end => end.scores.length > 0);
      const totalScore = completedEnds.reduce((sum, end) => sum + end.total, 0);
      const totalArrows = completedEnds.reduce((sum, end) => sum + end.scores.length, 0);
      const averageScore = totalArrows > 0 ? totalScore / totalArrows : 0;

      try {
        await modifyRound(roundId, {
          ends: updatedEnds,
          totalScore,
          averageScore,
          updatedAt: new Date(),
        });

        setRound({
          ...round,
          ends: updatedEnds,
          totalScore,
          averageScore,
        });
        setCurrentScores(previousEnd.scores);
        setCurrentEndIndex(previousEndIndex);
      } catch (error) {
        console.error('Failed to undo:', error);
        alert('取り消しに失敗しました');
      }
    }
  };

  const handleFinish = async () => {
    try {
      if (currentScores.length > 0) {
        const total = currentScores.reduce((sum, s) => sum + s.numericValue, 0);
        const updatedEnd: End = {
          endNumber: currentEndIndex + 1,
          scores: currentScores,
          total,
        };

        const updatedEnds = [...round.ends];
        updatedEnds[currentEndIndex] = updatedEnd;

        const completedEnds = updatedEnds.filter(end => end.scores.length > 0);
        const totalScore = completedEnds.reduce((sum, end) => sum + end.total, 0);
        const totalArrows = completedEnds.reduce((sum, end) => sum + end.scores.length, 0);
        const averageScore = totalArrows > 0 ? totalScore / totalArrows : 0;

        await modifyRound(roundId, {
          ends: updatedEnds,
          totalScore,
          averageScore,
          updatedAt: new Date(),
        });
      }

      router.push(`/rounds/${roundId}`);
    } catch (error) {
      console.error('Failed to finish round:', error);
      alert('記録の保存に失敗しました');
    }
  };

  const completedEnds = round.ends.slice(0, currentEndIndex);
  const totalScore = completedEnds.reduce((sum, end) => sum + end.total, 0) +
    currentScores.reduce((sum, s) => sum + s.numericValue, 0);
  const totalArrows = completedEnds.length * round.arrowsPerEnd + currentScores.length;
  const averageScore = totalArrows > 0 ? (totalScore / totalArrows).toFixed(2) : '0.00';
  const currentEndTotal = currentScores.reduce((sum, s) => sum + s.numericValue, 0);

  return (
    <>
      <div className="bg-white shadow sticky top-16 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center mb-2">
            <div className="text-lg font-semibold text-gray-900">
              {round.distance}m
            </div>
            <div className="text-sm text-gray-600">
              {currentEndIndex + 1} / {round.endsCount} エンド
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-xs text-gray-600">合計</div>
              <div className="text-2xl font-bold text-blue-600">{totalScore}</div>
            </div>
            <div>
              <div className="text-xs text-gray-600">平均</div>
              <div className="text-2xl font-bold text-green-600">{averageScore}</div>
            </div>
            <div>
              <div className="text-xs text-gray-600">今エンド</div>
              <div className="text-2xl font-bold text-purple-600">{currentEndTotal}</div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            第 {currentEndIndex + 1} エンド
          </h2>
          <div className="flex gap-2 mb-4 flex-wrap">
            {Array.from({ length: round.arrowsPerEnd }).map((_, i) => (
              <div
                key={i}
                className={`w-12 h-12 flex items-center justify-center rounded-lg border-2 font-semibold ${
                  i < currentScores.length
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'border-gray-300 text-gray-400'
                }`}
              >
                {i < currentScores.length ? currentScores[i].displayValue : i + 1}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-4 gap-3">
            {['X', '10', '9', '8', '7', '6', '5', '4', '3', '2', '1', 'M'].map((val) => (
              <button
                key={val}
                onClick={() => handleScoreInput(val === 'X' ? 'X' : val === 'M' ? 'M' : Number(val))}
                disabled={currentScores.length >= round.arrowsPerEnd}
                className={`h-16 text-xl font-bold rounded-lg transition-colors ${
                  val === 'X'
                    ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                    : val === '10'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : val === 'M'
                    ? 'bg-gray-400 text-white hover:bg-gray-500'
                    : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-blue-500 hover:bg-blue-50'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {val}
              </button>
            ))}
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={handleUndo}
              disabled={currentScores.length === 0 && currentEndIndex === 0}
              className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              取り消し
            </button>
            <button
              onClick={() => setShowFinishConfirm(true)}
              disabled={completedEnds.length === 0 && currentScores.length === 0}
              className="flex-1 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              終了
            </button>
          </div>
        </div>

        {completedEnds.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">記録済みエンド</h2>
            <div className="space-y-4">
              {completedEnds.map((end) => (
                <div key={end.endNumber} className="border-b pb-4 last:border-b-0">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-700">第 {end.endNumber} エンド</span>
                    <span className="text-lg font-bold text-blue-600">{end.total} 点</span>
                  </div>
                  <div className="flex gap-2">
                    {end.scores.map((score, i) => (
                      <div
                        key={i}
                        className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded text-sm font-semibold text-gray-700"
                      >
                        {score.displayValue}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {showFinishConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">記録を終了</h3>
            <p className="text-sm text-gray-600 mb-6">
              {currentEndIndex + 1 < round.endsCount
                ? `${round.endsCount - currentEndIndex - (currentScores.length === 0 ? 0 : 1)}エンドが未入力ですが、ここで終了しますか？`
                : 'この記録を終了しますか？'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowFinishConfirm(false)}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                キャンセル
              </button>
              <button
                onClick={handleFinish}
                className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                終了する
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
