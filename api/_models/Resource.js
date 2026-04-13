import mongoose from 'mongoose';

const ResourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    type: { type: String, enum: ['video', 'link', 'doc', 'note'], required: true },
    url: { type: String, default: null },
    content: { type: String, default: null },
    createdBy: { type: String, required: true, index: true },
    visibility: { type: String, enum: ['public', 'private'], default: 'private' },
    shareToken: { type: String, required: true, index: true },
    accessList: { type: [String], default: [] },
    pendingRequests: { type: [String], default: [] },
    topicId: { type: String, default: null },
    courseId: { type: String, default: null },
    createdAt: { type: String, default: null },
  },
  {
    timestamps: true,
    collection: 'resources',
  }
);

export const Resource = mongoose.models.Resource || mongoose.model('Resource', ResourceSchema);
