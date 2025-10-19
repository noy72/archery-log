'use server';

import { headers } from 'next/headers';
import { deleteRound } from '@/lib/rounds';

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
 * ラウンドを削除
 */
export async function removeRound(roundId: string): Promise<void> {
  const userId = await getUserId();
  return await deleteRound(userId, roundId);
}
