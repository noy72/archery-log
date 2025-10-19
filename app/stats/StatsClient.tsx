'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Round } from '@/lib/types';

interface StatsClientProps {
  rounds: Round[];
}

export default function StatsClient({ rounds }: StatsClientProps) {
  const [selectedDistance, setSelectedDistance] = useState<number | 'all'>('all');

  const availableDistances = Array.from(new Set(rounds.map(r => r.distance))).sort((a, b) => a - b);

  const filteredRounds = selectedDistance === 'all'
    ? rounds
    : rounds.filter(r => r.distance === selectedDistance);

  const calculateStats = () => {
    if (filteredRounds.length === 0) {
      return {
        totalRounds: 0,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        totalArrows: 0,
        scoreDistribution: {} as Record<string, number>,
      };
    }

    const totalRounds = filteredRounds.length;
    const allScores = filteredRounds.flatMap(r =>
      r.ends.filter(e => e.scores.length > 0).flatMap(e => e.scores)
    );
    const totalArrows = allScores.length;

    const scoreDistribution: Record<string, number> = {};
    allScores.forEach(score => {
      const key = score.displayValue;
      scoreDistribution[key] = (scoreDistribution[key] || 0) + 1;
    });

    const avgScore = filteredRounds.reduce((sum, r) => sum + r.totalScore, 0) / totalRounds;
    const highestScore = Math.max(...filteredRounds.map(r => r.totalScore));
    const lowestScore = Math.min(...filteredRounds.map(r => r.totalScore));

    return {
      totalRounds,
      averageScore: avgScore,
      highestScore,
      lowestScore,
      totalArrows,
      scoreDistribution,
    };
  };

  const stats = calculateStats();

  if (rounds.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-gray-900">統計データがありません</h3>
        <p className="mt-2 text-sm text-gray-500">記録を作成すると統計が表示されます</p>
        <div className="mt-6">
          <Link
            href="/rounds/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            新しい記録を開始
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">距離で絞り込み</label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedDistance('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedDistance === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            すべて
          </button>
          {availableDistances.map(distance => (
            <button
              key={distance}
              onClick={() => setSelectedDistance(distance)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedDistance === distance
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {distance}m
            </button>
          ))}
        </div>
      </div>

      {filteredRounds.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-600">選択した距離の記録がありません</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">総ラウンド数</div>
              <div className="text-3xl font-bold text-blue-600">{stats.totalRounds}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">平均得点</div>
              <div className="text-3xl font-bold text-green-600">
                {stats.averageScore.toFixed(0)}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">最高得点</div>
              <div className="text-3xl font-bold text-purple-600">{stats.highestScore}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">最低得点</div>
              <div className="text-3xl font-bold text-orange-600">{stats.lowestScore}</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">点数分布</h2>
            <div className="space-y-3">
              {['X', '10', '9', '8', '7', '6', '5', '4', '3', '2', '1', 'M'].map((score) => {
                const count = stats.scoreDistribution[score] || 0;
                const percentage = stats.totalArrows > 0
                  ? (count / stats.totalArrows * 100).toFixed(1)
                  : '0.0';

                return (
                  <div key={score} className="flex items-center gap-4">
                    <div className="w-12 text-right font-semibold text-gray-700">{score}</div>
                    <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          score === 'X' ? 'bg-yellow-500' :
                          score === '10' ? 'bg-blue-600' :
                          score === 'M' ? 'bg-gray-400' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-700">
                        {count > 0 && `${count}回 (${percentage}%)`}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {selectedDistance === 'all' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">距離別統計</h2>
              <div className="space-y-4">
                {availableDistances.map(distance => {
                  const distanceRounds = rounds.filter(r => r.distance === distance);
                  const avgScore = distanceRounds.reduce((sum, r) => sum + r.totalScore, 0) / distanceRounds.length;
                  const maxScore = Math.max(...distanceRounds.map(r => r.totalScore));

                  return (
                    <div key={distance} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-semibold text-gray-900">{distance}m</div>
                        <div className="text-sm text-gray-600">{distanceRounds.length} ラウンド</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">平均: {avgScore.toFixed(0)}</div>
                        <div className="text-sm text-gray-600">最高: {maxScore}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
