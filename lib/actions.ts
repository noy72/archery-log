'use server';

import { headers } from 'next/headers';
import { getRounds, getRound } from './rounds';
import { Round } from './types';

async function getUserId(): Promise<string> {
  const headersList = await headers();

  const idHeader = headersList.get('x-goog-authenticated-user-id');

  if (idHeader) {
    return idHeader.split(':')[1];
  }

  return 'dev_user_001';
}

export async function fetchRounds(): Promise<Round[]> {
  const userId = await getUserId();
  return await getRounds(userId);
}

export async function fetchRound(roundId: string): Promise<Round | null> {
  const userId = await getUserId();
  return await getRound(userId, roundId);
}
