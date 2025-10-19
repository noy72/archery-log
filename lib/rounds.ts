import { db } from './firestore';
import { Round, RoundInput, End } from './types';
import { Timestamp } from '@google-cloud/firestore';

function timestampToDate(timestamp: Timestamp | Date | string | number): Date {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  if (timestamp instanceof Date) {
    return timestamp;
  }
  return new Date(timestamp);
}

function convertFirestoreToRound(doc: FirebaseFirestore.DocumentSnapshot): Round {
  const data = doc.data()!;
  return {
    id: doc.id,
    userId: data.userId,
    type: data.type,
    distance: data.distance,
    endsCount: data.endsCount,
    arrowsPerEnd: data.arrowsPerEnd,
    date: timestampToDate(data.date),
    location: data.location,
    memo: data.memo,
    totalScore: data.totalScore,
    averageScore: data.averageScore,
    ends: data.ends,
    createdAt: timestampToDate(data.createdAt),
    updatedAt: timestampToDate(data.updatedAt),
  };
}

export async function saveRound(userId: string, input: RoundInput, ends: End[]): Promise<string> {
  const totalScore = ends.reduce((sum, end) => sum + end.total, 0);
  const totalArrows = input.endsCount * input.arrowsPerEnd;
  const averageScore = totalScore / totalArrows;

  const roundData = {
    userId,
    type: input.type,
    distance: input.distance,
    endsCount: input.endsCount,
    arrowsPerEnd: input.arrowsPerEnd,
    date: input.date,
    location: input.location,
    memo: input.memo,
    totalScore,
    averageScore,
    ends,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const docRef = await db.collection('rounds').add(roundData);
  return docRef.id;
}

export async function getRounds(userId: string): Promise<Round[]> {
  const snapshot = await db
    .collection('rounds')
    .where('userId', '==', userId)
    .orderBy('date', 'desc')
    .get();

  return snapshot.docs.map(doc => convertFirestoreToRound(doc));
}

export async function getRound(userId: string, roundId: string): Promise<Round | null> {
  const doc = await db.collection('rounds').doc(roundId).get();

  if (!doc.exists) return null;

  const data = doc.data()!;

  if (data.userId !== userId) {
    throw new Error('Unauthorized: You can only access your own rounds');
  }

  return convertFirestoreToRound(doc);
}

export async function deleteRound(userId: string, roundId: string): Promise<void> {
  const doc = await db.collection('rounds').doc(roundId).get();

  if (!doc.exists) {
    throw new Error('Round not found');
  }

  const data = doc.data();

  if (data?.userId !== userId) {
    throw new Error('Unauthorized: You can only delete your own rounds');
  }

  await db.collection('rounds').doc(roundId).delete();
}

export async function updateRound(
  userId: string,
  roundId: string,
  updates: Partial<Omit<Round, 'id' | 'userId' | 'createdAt'>>
): Promise<void> {
  const doc = await db.collection('rounds').doc(roundId).get();

  if (!doc.exists) {
    throw new Error('Round not found');
  }

  const data = doc.data();

  if (data?.userId !== userId) {
    throw new Error('Unauthorized: You can only update your own rounds');
  }

  await db.collection('rounds').doc(roundId).update({
    ...updates,
    updatedAt: new Date(),
  });
}
