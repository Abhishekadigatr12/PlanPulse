import mongoose from 'mongoose';

const CourseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    ownerUsername: { type: String, required: true, index: true },
    topics: { type: Array, default: [] },
  },
  {
    timestamps: true,
    collection: 'courses',
  }
);

export const Course = mongoose.models.Course || mongoose.model('Course', CourseSchema);
