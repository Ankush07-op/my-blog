const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Post title is required'],
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    index: true
  },
  summary: {
    type: String,
    required: [true, 'Summary is required'],
    maxlength: 500
  },
  content: {
    type: String,
    required: [true, 'Post content is required']
  },
  coverImage: {
    type: String,
    default: ''
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
    index: true
  },
  tags: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'published',
    index: true
  },
  viewsCount: { type: Number, default: 0 },
  likesCount: { type: Number, default: 0 },
  commentCount: { type: Number, default: 0 },
  readTimeMinutes: { type: Number, default: 3 },
  publishedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Text search index for title, summary, content, and tags
PostSchema.index({ title: 'text', summary: 'text', content: 'text', tags: 'text' });
// Compound index for filtering & sorting
PostSchema.index({ status: 1, categoryId: 1, publishedAt: -1 });

module.exports = mongoose.model('Post', PostSchema);
