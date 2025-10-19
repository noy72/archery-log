'use server';

import { headers } from 'next/headers';
import { saveRound } from '@/lib/rounds';
import { RoundInput, End } from '@/lib/types';

async function getUserId(): Promise<string> {
  const headersList = await headers();
  const idHeader = headersList.get('x-goog-authenticated-user-id');

  if (idHeader) {
    return idHeader.split(':')[1];
  }

  // 開発環境用: デフォルトのダミーユーザー ID を返す
  return 'dev_user_001';
}

/**
 * 新しいラウンドを初期化（空の ends で作成）
 */
export async function initializeRound(roundInput: RoundInput): Promise<string> {
  const userId = await getUserId();

  // 空の ends を作成
  const emptyEnds: End[] = Array.from({ length: roundInput.endsCount }, (_, i) => ({
    endNumber: i + 1,
    scores: [],
    total: 0,
  }));

  return await saveRound(userId, roundInput, emptyEnds);
}
