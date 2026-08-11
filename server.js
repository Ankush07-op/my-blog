const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB Database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files
app.use(express.static(__dirname));

// Import Models
const Post = require('./models/Post');
const Category = require('./models/Category');
const Comment = require('./models/Comment');
const ContactMessage = require('./models/ContactMessage');

// ==================== API ROUTES ====================

// 1. GET /api/posts - Fetch all published posts (with optional category filter & search query)
app.get('/api/posts', async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = { status: 'published' };

    if (category && category !== 'all') {
      const catObj = await Category.findOne({ slug: category.toLowerCase() });
      if (catObj) {
        query.categoryId = catObj._id;
      }
    }

    if (search) {
      query.$text = { $search: search };
    }

    const posts = await Post.find(query)
      .populate('categoryId', 'name slug')
      .populate('authorId', 'username profile')
      .sort({ publishedAt: -1 });

    res.json({ success: true, count: posts.length, data: posts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. GET /api/posts/:slug - Fetch single post by slug
app.get('/api/posts/:slug', async (req, res) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug, status: 'published' })
      .populate('categoryId', 'name slug')
      .populate('authorId', 'username profile');

    if (!post) {
      return res.status(404).json({ success: false, error: 'Blog post not found' });
    }

    // Increment views count atomically
    post.viewsCount += 1;
    await post.save();

    res.json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. GET /api/categories - Fetch categories
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. GET & POST /api/comments - Fetch and add comments
app.get('/api/comments/:postId', async (req, res) => {
  try {
    const comments = await Comment.find({ postId: req.params.postId, isApproved: true })
      .sort({ createdAt: -1 });
    res.json({ success: true, data: comments });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/comments', async (req, res) => {
  try {
    const { postId, name, email, content } = req.body;

    if (!postId || !name || !content) {
      return res.status(400).json({ success: false, error: 'Please provide all required fields' });
    }

    const newComment = await Comment.create({
      postId,
      authorDetails: { name, email: email || 'guest@myblog.com' },
      content
    });

    // Update comment count on post
    await Post.findByIdAndUpdate(postId, { $inc: { commentCount: 1 } });

    res.status(201).json({ success: true, data: newComment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5. POST /api/contact - Submit contact form message
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, error: 'Please provide name, email, and message' });
    }

    const newMessage = await ContactMessage.create({ name, email, message });
    res.status(201).json({ success: true, message: 'Message sent successfully!', data: newMessage });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 6. GET /api/admin/messages - Fetch all contact messages for admin
app.get('/api/admin/messages', async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
