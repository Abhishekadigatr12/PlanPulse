import { connectToDatabase } from './_lib/mongoose.js';
import { Resource } from './_models/Resource.js';

function sendMethodNotAllowed(res) {
  res.setHeader('Allow', 'POST');
  return res.status(405).json({ error: 'Method not allowed' });
}

export default async function handler(req, res) {
  try {
    await connectToDatabase();

    if (req.method !== 'POST') {
      return sendMethodNotAllowed(res);
    }

    const {
      title,
      type,
      url,
      content,
      createdBy,
      visibility = 'private',
      shareToken,
      accessList = [],
      pendingRequests = [],
      topicId,
      courseId,
      createdAt,
    } = req.body || {};

    if (!title || !type || !createdBy || !shareToken) {
      return res.status(400).json({ error: 'title, type, createdBy, and shareToken are required' });
    }

    const resource = await Resource.create({
      title,
      type,
      url: url || null,
      content: content || null,
      createdBy,
      visibility,
      shareToken,
      accessList,
      pendingRequests,
      topicId: topicId || null,
      courseId: courseId || null,
      createdAt: createdAt || new Date().toISOString(),
    });

    return res.status(201).json({ resource });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Server error' });
  }
}
