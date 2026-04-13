import crypto from 'crypto';
import { connectDb } from './_lib/db.js';
import { ResourceModel } from './models/Resource.js';

const generateToken = () => crypto.randomBytes(12).toString('hex');

function serializeResource(doc) {
  const plain = typeof doc.toObject === 'function' ? doc.toObject() : doc;
  return {
    id: String(plain._id),
    title: plain.title,
    type: plain.type,
    url: plain.url || undefined,
    content: plain.content || undefined,
    createdBy: plain.ownerUsername,
    visibility: plain.visibility,
    shareToken: plain.shareToken,
    accessList: Array.isArray(plain.accessList) ? plain.accessList : [],
    pendingRequests: Array.isArray(plain.pendingRequests) ? plain.pendingRequests : [],
    topicId: plain.topicId || undefined,
    courseId: plain.courseId || undefined,
    createdAt: plain.createdAt || new Date().toISOString(),
  };
}

export default async function handler(req, res) {
  try {
    await connectDb();

    if (req.method === 'POST') {
      const {
        ownerUsername,
        createdBy,
        title,
        type = 'link',
        visibility = 'private',
        url = '',
        content = '',
        accessList = [],
        pendingRequests = [],
        topicId = '',
        courseId = '',
      } = req.body || {};

      const normalizedOwner = ownerUsername || createdBy;

      if (!normalizedOwner || !title) {
        return res.status(400).json({ error: 'ownerUsername (or createdBy) and title are required' });
      }

      const normalizedAccess = Array.from(new Set([normalizedOwner, ...(Array.isArray(accessList) ? accessList : [])]));

      const resource = await ResourceModel.create({
        ownerUsername: normalizedOwner,
        title,
        type,
        visibility,
        url,
        content,
        shareToken: generateToken(),
        accessList: normalizedAccess,
        pendingRequests: Array.isArray(pendingRequests) ? pendingRequests : [],
        topicId,
        courseId,
      });

      return res.status(201).json({ resource: serializeResource(resource) });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Server error' });
  }
}
