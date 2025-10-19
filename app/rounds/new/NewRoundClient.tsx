'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { initializeRound } from './actions';

interface RoundFormData {
  type: 'standard' | 'custom';
  distance: number;
  customDistance: string;
  endsCount: number;
  arrowsPerEnd: number;
  location: string;
  memo: string;
}

export default function NewRoundClient() {
  const router = useRouter();

  // 単一の state でフォームデータを管理
  const [formData, setFormData] = useState<RoundFormData>({
    type: 'standard',
    distance: 30,
    customDistance: '',
    endsCount: 5,
    arrowsPerEnd: 6,
    location: '',
    memo: '',
  });

  // フォームデータ更新用のヘルパー関数
  const updateFormData = (updates: Partial<RoundFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const roundInput = {
      type: formData.type,
      distance: formData.type === 'custom' ? Number(formData.customDistance) : formData.distance,
      endsCount: formData.type === 'custom' ? formData.endsCount : formData.distance === 30 ? 5 : 6,
      arrowsPerEnd: formData.arrowsPerEnd,
      date: new Date(),
      location: formData.location || undefined,
      memo: formData.memo || undefined,
    };

    try {
      // Server Action で Round を初期化して保存
      const roundId = await initializeRound(roundInput);
      router.push(`/rounds/${roundId}/score`);
    } catch (error) {
      console.error('Failed to initialize round:', error);
      alert('ラウンドの作成に失敗しました');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">新しい記録</h1>
          <Link href="/" className="text-sm text-blue-600 hover:text-blue-800">
            ホームに戻る
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ラウンドタイプ
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => updateFormData({ type: 'standard' })}
                className={`p-4 border-2 rounded-lg text-center ${
                  formData.type === 'standard'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="font-semibold">標準ラウンド</div>
                <div className="text-sm text-gray-600">30m / 50m / 70m</div>
              </button>
              <button
                type="button"
                onClick={() => updateFormData({ type: 'custom' })}
                className={`p-4 border-2 rounded-lg text-center ${
                  formData.type === 'custom'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="font-semibold">カスタム</div>
                <div className="text-sm text-gray-600">自由設定</div>
              </button>
            </div>
          </div>

          {formData.type === 'standard' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                距離
              </label>
              <div className="grid grid-cols-3 gap-4">
                {[30, 50, 70].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => updateFormData({ distance: d })}
                    className={`p-4 border-2 rounded-lg text-center font-semibold ${
                      formData.distance === d
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {d}m
                  </button>
                ))}
              </div>
              <p className="mt-2 text-sm text-gray-600">
                {formData.distance === 30 ? '6射 × 5エンド' : '6射 × 6エンド'}
              </p>
            </div>
          ) : (
            <>
              <div>
                <label htmlFor="customDistance" className="block text-sm font-medium text-gray-700 mb-1">
                  距離 (m)
                </label>
                <input
                  id="customDistance"
                  type="number"
                  min="1"
                  required
                  value={formData.customDistance}
                  onChange={(e) => updateFormData({ customDistance: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例: 18"
                />
              </div>
              <div>
                <label htmlFor="endsCount" className="block text-sm font-medium text-gray-700 mb-1">
                  エンド数
                </label>
                <input
                  id="endsCount"
                  type="number"
                  min="1"
                  required
                  value={formData.endsCount}
                  onChange={(e) => updateFormData({ endsCount: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="arrowsPerEnd" className="block text-sm font-medium text-gray-700 mb-1">
                  1エンドあたりの射数
                </label>
                <input
                  id="arrowsPerEnd"
                  type="number"
                  min="1"
                  required
                  value={formData.arrowsPerEnd}
                  onChange={(e) => updateFormData({ arrowsPerEnd: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              場所（任意）
            </label>
            <input
              id="location"
              type="text"
              value={formData.location}
              onChange={(e) => updateFormData({ location: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例: 〇〇アーチェリー場"
            />
          </div>

          <div>
            <label htmlFor="memo" className="block text-sm font-medium text-gray-700 mb-1">
              メモ（任意）
            </label>
            <textarea
              id="memo"
              rows={3}
              value={formData.memo}
              onChange={(e) => updateFormData({ memo: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="天候、コンディションなど"
            />
          </div>

          <div className="flex gap-4">
            <Link
              href="/"
              className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-center font-medium text-gray-700 hover:bg-gray-50"
            >
              キャンセル
            </Link>
            <button
              type="submit"
              className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              記録を開始
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
