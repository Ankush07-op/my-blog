const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  authorDetails: {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true }
  },
  content: {
    type: String,
    required: [true, 'Comment text is required'],
    maxlength: 1000
  },
  parentCommentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null,
    index: true
  },
  isApproved: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

CommentSchema.index({ postId: 1, isApproved: 1, createdAt: -1 });

module.exports = mongoose.model('Comment', CommentSchema);
