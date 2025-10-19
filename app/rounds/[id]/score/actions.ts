'use server';

import { headers } from 'next/headers';
import { updateRound } from '@/lib/rounds';
import { Round } from '@/lib/types';

async function getUserId(): Promise<string> {
  const headersList = await headers();
  const idHeader = headersList.get('x-goog-authenticated-user-id');

  if (idHeader) {
    return idHeader.split(':')[1];
  }

  return 'dev_user_001';
}

export async function modifyRound(
  roundId: string,
  updates: Partial<Omit<Round, 'id' | 'userId' | 'createdAt'>>
): Promise<void> {
  const userId = await getUserId();
  return await updateRound(userId, roundId, updates);
}
