import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB_NAME || 'planplus';
const COLLECTION_NAME = process.env.MONGODB_COLLECTION_NAME || 'cloud_state';
const DOC_ID = 'shared-state';

let cachedClient = null;

async function getCollection() {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not configured');
  }

  if (!cachedClient) {
    cachedClient = new MongoClient(MONGODB_URI);
    await cachedClient.connect();
  }

  return cachedClient.db(DB_NAME).collection(COLLECTION_NAME);
}

function sanitizeState(input) {
  if (!input || typeof input !== 'object') return null;

  const users = input.users;
  const userData = input.userData;
  const globalResources = input.globalResources;
  const updatedAt = input.updatedAt;

  if (typeof users !== 'object' || users === null) return null;
  if (typeof userData !== 'object' || userData === null) return null;
  if (!Array.isArray(globalResources)) return null;

  const safeUpdatedAt = typeof updatedAt === 'number' ? updatedAt : Date.now();

  return {
    users,
    userData,
    globalResources,
    updatedAt: safeUpdatedAt,
  };
}

export default async function handler(req, res) {
  try {
    const collection = await getCollection();

    if (req.method === 'GET') {
      const doc = await collection.findOne({ _id: DOC_ID });
      if (!doc || !doc.state) {
        return res.status(200).json({ state: null });
      }
      return res.status(200).json({ state: doc.state });
    }

    if (req.method === 'POST') {
      const parsedState = sanitizeState(req.body?.state);
      if (!parsedState) {
        return res.status(400).json({ error: 'Invalid state payload' });
      }

      const existing = await collection.findOne({ _id: DOC_ID });
      const existingUpdatedAt = existing?.state?.updatedAt || 0;

      if (existing && existingUpdatedAt > parsedState.updatedAt) {
        return res.status(200).json({ ok: true, ignored: true });
      }

      await collection.updateOne(
        { _id: DOC_ID },
        {
          $set: {
            state: parsedState,
            syncedAt: new Date().toISOString(),
          },
        },
        { upsert: true }
      );

      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Server error' });
  }
}
