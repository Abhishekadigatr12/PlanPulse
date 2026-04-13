import { connectDb } from './_lib/db.js';
import { CourseModel } from './models/Course.js';

function serializeCourse(doc) {
  const plain = typeof doc.toObject === 'function' ? doc.toObject() : doc;
  return {
    id: String(plain._id),
    title: plain.title,
    description: plain.description || '',
    topics: Array.isArray(plain.topics) ? plain.topics : [],
    createdAt: plain.createdAt || new Date().toISOString(),
    updatedAt: plain.updatedAt || new Date().toISOString(),
    ownerUsername: plain.ownerUsername,
  };
}

export default async function handler(req, res) {
  try {
    await connectDb();

    if (req.method === 'POST') {
      const { ownerUsername, title, description = '', topics = [] } = req.body || {};

      if (!ownerUsername || !title) {
        return res.status(400).json({ error: 'ownerUsername and title are required' });
      }

      const course = await CourseModel.create({
        ownerUsername,
        title,
        description,
        topics: Array.isArray(topics) ? topics : [],
      });

      return res.status(201).json({ course: serializeCourse(course) });
    }

    if (req.method === 'GET') {
      const ownerUsername = typeof req.query.ownerUsername === 'string' ? req.query.ownerUsername : undefined;
      const query = ownerUsername ? { ownerUsername } : {};

      const courses = await CourseModel.find(query).sort({ updatedAt: -1 }).lean();
      return res.status(200).json({ courses: courses.map((course) => serializeCourse(course)) });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Server error' });
  }
}
