import { Firestore, Settings } from '@google-cloud/firestore';

const firestoreConfig: Settings = {
  projectId: process.env.FIRESTORE_PROJECT_ID || 'archery-log-dev',
  ignoreUndefinedProperties: true,
};

if (process.env.FIRESTORE_EMULATOR_HOST) {
  firestoreConfig.host = process.env.FIRESTORE_EMULATOR_HOST;
  firestoreConfig.ssl = false;
  firestoreConfig.customHeaders = {
    'Authorization': 'Bearer owner'
  };
}

const db = new Firestore(firestoreConfig);

export { db };
