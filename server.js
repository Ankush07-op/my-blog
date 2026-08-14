const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
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

// Serve static frontend assets safely from public/ directory
app.use(express.static(path.join(__dirname, 'public')));

// Import Models
const Post = require('./models/Post');
const Category = require('./models/Category');
const Comment = require('./models/Comment');
const ContactMessage = require('./models/ContactMessage');
const User = require('./models/User');

// Helper function to generate slug
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-');
};

// Helper function to get default admin user ID
const getDefaultAuthorId = async () => {
  let admin = await User.findOne({ role: 'admin' });
  if (!admin) {
    admin = await User.create({
      username: 'admin',
      email: 'admin@myblog.com',
      passwordHash: 'admin123',
      role: 'admin',
      profile: { fullName: 'Blog Admin' }
    });
  }
  return admin._id;
};

// ==================== API ROUTES ====================

// 1. GET /api/posts - Fetch published posts (with category filter & search)
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
      const searchRegex = new RegExp(search, 'i');
      query.$or = [{ title: searchRegex }, { summary: searchRegex }];
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

// 2. GET /api/posts/:slug - Fetch single post by slug & atomic view increment
app.get('/api/posts/:slug', async (req, res) => {
  try {
    const post = await Post.findOneAndUpdate(
      { slug: req.params.slug, status: 'published' },
      { $inc: { viewsCount: 1 } },
      { new: true }
    )
      .populate('categoryId', 'name slug')
      .populate('authorId', 'username profile');

    if (!post) {
      return res.status(404).json({ success: false, error: 'Blog post not found' });
    }

    res.json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. POST /api/posts - Create a new blog post (Admin / Author endpoint)
app.post('/api/posts', async (req, res) => {
  try {
    const { title, categoryName, summary, content, coverImage, readTimeMinutes } = req.body;

    if (!title || !summary || !content) {
      return res.status(400).json({ success: false, error: 'Please provide title, summary, and content' });
    }

    let slug = slugify(title);
    const existingPost = await Post.findOne({ slug });
    if (existingPost) {
      slug = `${slug}-${Date.now()}`;
    }

    // Find or create Category
    const catName = categoryName || 'Tech';
    let catObj = await Category.findOne({ name: catName });
    if (!catObj) {
      catObj = await Category.create({
        name: catName,
        slug: slugify(catName),
        description: `${catName} category articles`
      });
    }

    const authorId = await getDefaultAuthorId();

    const newPost = await Post.create({
      title,
      slug,
      summary,
      content,
      coverImage: coverImage || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
      categoryId: catObj._id,
      authorId,
      readTimeMinutes: readTimeMinutes || 3,
      status: 'published'
    });

    res.status(201).json({ success: true, message: 'Blog post created successfully!', data: newPost });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. DELETE /api/posts/:id - Delete a blog post by ID
app.delete('/api/posts/:id', async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    // Also delete associated comments
    await Comment.deleteMany({ postId: req.params.id });

    res.json({ success: true, message: 'Post and comments deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5. GET /api/categories - Fetch categories
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 6. GET & POST /api/comments - Fetch and add comments
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

// 7. POST /api/contact - Submit contact form message
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

// 8. GET /api/admin/messages - Fetch all contact messages for admin
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
