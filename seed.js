const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');
const Category = require('./models/Category');
const Post = require('./models/Post');
const Comment = require('./models/Comment');
const ContactMessage = require('./models/ContactMessage');

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB for database seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Category.deleteMany({});
    await Post.deleteMany({});
    await Comment.deleteMany({});
    await ContactMessage.deleteMany({});
    console.log('🧹 Cleared existing database collections.');

    // 1. Create Default Admin User
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@myblog.com',
      passwordHash: 'hashed_admin_password_123', // Demo placeholder
      role: 'admin',
      profile: {
        fullName: 'Blog Admin',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
        bio: 'Tech enthusiast, writer, and web developer.'
      }
    });
    console.log('👤 Created Admin User:', adminUser.username);

    // 2. Create Categories
    const techCategory = await Category.create({
      name: 'Tech',
      slug: 'tech',
      description: 'Web development, technology, and programming tutorials.'
    });

    const personalCategory = await Category.create({
      name: 'Personal',
      slug: 'personal',
      description: 'Personal experiences, life lessons, and productivity tips.'
    });
    console.log('📂 Created Categories: Tech, Personal');

    // 3. Create Sample Posts (Matching index.html & post.html content)
    const post1 = await Post.create({
      title: 'My First Blog',
      slug: 'my-first-blog',
      summary: 'Learning HTML, CSS, and JavaScript step by step...',
      content: 'This is the full content of my blog post. Here you can write detailed explanations, code examples, and share your technical knowledge with readers.\n\nBlogging helps you improve writing skills and also builds a great technical portfolio for your career.',
      coverImage: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
      authorId: adminUser._id,
      categoryId: techCategory._id,
      tags: ['html', 'css', 'javascript', 'beginners'],
      status: 'published',
      viewsCount: 154,
      likesCount: 23,
      commentCount: 2,
      readTimeMinutes: 3
    });

    const post2 = await Post.create({
      title: 'My College Life',
      slug: 'my-college-life',
      summary: 'Sharing my personal experiences, campus life, and learning journeys...',
      content: 'College is a unique period of self-discovery, building friendships, and balancing academics with real-world projects.\n\nHere are some of the key lessons I learned during my college years...',
      coverImage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
      authorId: adminUser._id,
      categoryId: personalCategory._id,
      tags: ['personal', 'college', 'life'],
      status: 'published',
      viewsCount: 98,
      likesCount: 15,
      commentCount: 1,
      readTimeMinutes: 4
    });

    const post3 = await Post.create({
      title: 'JavaScript Basics',
      slug: 'javascript-basics',
      summary: 'Understanding JS step by step - functions, DOM manipulation, and modern syntax...',
      content: 'JavaScript powers the dynamic web. From simple DOM manipulation like toggling dark mode to building full-stack applications with Node.js and MongoDB.\n\nLet us break down basic functions, objects, and event listeners!',
      coverImage: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?auto=format&fit=crop&w=800&q=80',
      authorId: adminUser._id,
      categoryId: techCategory._id,
      tags: ['javascript', 'webdev', 'frontend'],
      status: 'published',
      viewsCount: 310,
      likesCount: 45,
      commentCount: 3,
      readTimeMinutes: 5
    });

    console.log('📝 Created 3 Initial Blog Posts');

    // 4. Create Sample Comments
    await Comment.create({
      postId: post1._id,
      userId: adminUser._id,
      authorDetails: { name: 'Alex Johnson', email: 'alex@example.com' },
      content: 'Awesome first blog post! Excited to read more tutorials from you.',
      isApproved: true
    });

    await Comment.create({
      postId: post1._id,
      authorDetails: { name: 'Priya Sharma', email: 'priya@example.com' },
      content: 'Very clear explanation. Keep it up!',
      isApproved: true
    });
    console.log('💬 Created Sample Comments');

    // 5. Create Sample Contact Message (For admin.html)
    await ContactMessage.create({
      name: 'John Doe',
      email: 'john@example.com',
      message: 'Hello, I loved your blog on JavaScript basics. Would love to connect!',
      isRead: false
    });
    console.log('✉️ Created Sample Contact Message');

    console.log('\n🎉 Database setup & seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error Seeding Database:', error.message);
    process.exit(1);
  }
};

seedDatabase();
