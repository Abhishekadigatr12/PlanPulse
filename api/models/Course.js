import mongoose from 'mongoose';

const CourseSchema = new mongoose.Schema(
  {
    ownerUsername: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      default: '',
      maxlength: 2000,
    },
    topics: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const CourseModel = mongoose.models.Course || mongoose.model('Course', CourseSchema);
