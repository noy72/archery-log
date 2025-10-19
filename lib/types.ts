export interface User {
  uid: string;
  email: string;
  displayName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Score {
  value: number | 'M' | 'X';
  displayValue: string;
  numericValue: number;
}

export interface End {
  endNumber: number;
  scores: Score[];
  total: number;
}

export interface Round {
  id: string;
  userId: string;
  type: 'standard' | 'custom';
  distance: 30 | 50 | 70 | number;
  endsCount: number;
  arrowsPerEnd: number;
  date: Date;
  location?: string;
  memo?: string;
  totalScore: number;
  averageScore: number;
  ends: End[];
  createdAt: Date;
  updatedAt: Date;
}

export interface RoundInput {
  type: 'standard' | 'custom';
  distance: 30 | 50 | 70 | number;
  endsCount: number;
  arrowsPerEnd: number;
  date: Date;
  location?: string;
  memo?: string;
}
