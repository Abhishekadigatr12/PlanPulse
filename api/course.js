import { connectToDatabase } from './_lib/mongoose.js';
import { Course } from './_models/Course.js';

function sendMethodNotAllowed(res) {
  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'Method not allowed' });
}

export default async function handler(req, res) {
  try {
    await connectToDatabase();

    if (req.method === 'POST') {
      const { title, description = '', ownerUsername, topics = [] } = req.body || {};

      if (!title || !ownerUsername) {
        return res.status(400).json({ error: 'title and ownerUsername are required' });
      }

      const createdCourse = await Course.create({
        title,
        description,
        ownerUsername,
        topics,
      });

      return res.status(201).json({ course: createdCourse });
    }

    if (req.method === 'GET') {
      const ownerUsername = req.query?.ownerUsername;
      const filter = ownerUsername ? { ownerUsername } : {};
      const courses = await Course.find(filter).sort({ createdAt: -1 }).lean();
      return res.status(200).json({ courses });
    }

    return sendMethodNotAllowed(res);
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Server error' });
  }
}
