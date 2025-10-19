'use server';

import { headers } from 'next/headers';
import { User } from './types';

export async function getCurrentUser(): Promise<User | null> {
  try {
    const headersList = await headers();

    const emailHeader = headersList.get('x-goog-authenticated-user-email');
    const idHeader = headersList.get('x-goog-authenticated-user-id');

    if (!emailHeader || !idHeader) {
      return {
        uid: 'dev_user_001',
        email: 'dev@example.com',
        displayName: '開発ユーザー',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    const email = emailHeader.split(':')[1];
    const userId = idHeader.split(':')[1];
    const displayName = email.split('@')[0];

    return {
      uid: userId,
      email,
      displayName,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  } catch (error) {
    console.error('Error getting user from IAP headers:', error);
    return null;
  }
}
