import mongoose from 'mongoose';

const ResourceSchema = new mongoose.Schema(
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
    type: {
      type: String,
      enum: ['video', 'link', 'doc', 'note'],
      default: 'link',
    },
    visibility: {
      type: String,
      enum: ['public', 'private'],
      default: 'private',
    },
    url: {
      type: String,
      default: '',
    },
    content: {
      type: String,
      default: '',
    },
    shareToken: {
      type: String,
      default: '',
      index: true,
    },
    accessList: {
      type: [String],
      default: [],
    },
    pendingRequests: {
      type: [String],
      default: [],
    },
    topicId: {
      type: String,
      default: '',
    },
    courseId: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export const ResourceModel = mongoose.models.Resource || mongoose.model('Resource', ResourceSchema);
