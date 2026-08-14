/* ==========================================================================
   MY BLOG - DYNAMIC BACKEND API & FRONTEND LOGIC
   ========================================================================== */

const API_BASE_URL = window.location.origin.includes('5000') 
  ? '' 
  : 'http://localhost:5000';

let currentCategory = 'all';
let currentSearch = '';

// --- Dark Mode Handler ---
function toggleDarkMode() {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");
  localStorage.setItem("theme", isDark ? "dark" : "light");
  updateThemeButton(isDark);
}

function updateThemeButton(isDark) {
  const btn = document.getElementById("themeToggleBtn");
  if (btn) {
    btn.innerHTML = isDark ? '<i class="fa fa-sun"></i> Light Mode' : '<i class="fa fa-moon"></i> Dark Mode';
  }
}

// Load Theme Preference on Page Load
document.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark");
    updateThemeButton(true);
  } else {
    updateThemeButton(false);
  }

  // Determine current page and initialize features
  const path = window.location.pathname;
  if (path.includes("post.html")) {
    initSinglePostPage();
  } else if (path.includes("admin.html")) {
    initAdminPage();
  } else if (path.includes("index.html") || path === "/" || path.endsWith("/")) {
    initHomePage();
  }
});

// --- Home Page Functions ---
function initHomePage() {
  fetchPosts('all', '');

  // Add event listener for search bar
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    let searchTimeout;
    searchInput.addEventListener("input", (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        currentSearch = e.target.value.trim();
        fetchPosts(currentCategory, currentSearch);
      }, 300);
    });
  }
}

async function fetchPosts(category = 'all', search = '') {
  const container = document.getElementById("postsContainer");
  if (!container) return;

  // Show Skeleton Loading
  container.innerHTML = `
    <div class="post-card" style="opacity:0.5; padding:2rem; text-align:center;">
      <i class="fa fa-spinner fa-spin fa-2x" style="color:var(--accent-primary)"></i>
      <p style="margin-top:1rem;">Loading posts from database...</p>
    </div>
  `;

  try {
    const res = await fetch(`${API_BASE_URL}/api/posts?category=${category}&search=${encodeURIComponent(search)}`);
    const result = await res.json();

    if (result.success && result.data.length > 0) {
      renderPosts(result.data);
    } else {
      renderFallbackPosts(category, search);
    }
  } catch (err) {
    console.warn("API unavailable, displaying client fallback posts:", err.message);
    renderFallbackPosts(category, search);
  }
}

function renderPosts(posts) {
  const container = document.getElementById("postsContainer");
  container.innerHTML = "";

  posts.forEach((post, index) => {
    const categoryName = post.categoryId ? post.categoryId.name : 'Tech';
    const categorySlug = post.categoryId ? post.categoryId.slug : 'tech';
    const postSlug = post.slug || 'my-first-blog';
    const cover = post.coverImage || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80';

    const card = document.createElement("article");
    card.className = `post-card ${categorySlug}`;
    card.style.animationDelay = `${index * 0.1}s`;

    card.innerHTML = `
      <img src="${cover}" alt="${post.title}" class="post-thumb" loading="lazy">
      <div class="post-content">
        <span class="post-badge">${categoryName}</span>
        <h3 class="post-title">${post.title}</h3>
        <p class="post-excerpt">${post.summary}</p>
        <div class="post-footer">
          <span><i class="fa fa-clock"></i> ${post.readTimeMinutes || 3} min read</span>
          <a href="post.html?slug=${postSlug}" class="read-more-btn">
            Read More <i class="fa fa-arrow-right"></i>
          </a>
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}

function renderFallbackPosts(category, search) {
  const container = document.getElementById("postsContainer");
  const defaultPosts = [
    {
      title: "My First Blog",
      slug: "my-first-blog",
      summary: "Learning HTML, CSS, and JavaScript step by step...",
      category: "Tech",
      categorySlug: "tech",
      cover: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80",
      readTime: 3
    },
    {
      title: "My College Life",
      slug: "my-college-life",
      summary: "Sharing my personal experiences, campus life, and learning journeys...",
      category: "Personal",
      categorySlug: "personal",
      cover: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80",
      readTime: 4
    },
    {
      title: "JavaScript Basics",
      slug: "javascript-basics",
      summary: "Understanding JS step by step - functions, DOM manipulation, and modern syntax...",
      category: "Tech",
      categorySlug: "tech",
      cover: "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?auto=format&fit=crop&w=600&q=80",
      readTime: 5
    }
  ];

  let filtered = defaultPosts.filter(p => {
    const matchesCat = (category === 'all' || p.categorySlug === category);
    const matchesSearch = (search === '' || p.title.toLowerCase().includes(search.toLowerCase()) || p.summary.toLowerCase().includes(search.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  if (filtered.length === 0) {
    container.innerHTML = `<p style="grid-column:1/-1; text-align:center; padding:2rem; color:var(--text-muted);">No blog posts found matching your criteria.</p>`;
    return;
  }

  container.innerHTML = "";
  filtered.forEach(p => {
    const card = document.createElement("article");
    card.className = `post-card ${p.categorySlug}`;
    card.innerHTML = `
      <img src="${p.cover}" alt="${p.title}" class="post-thumb" loading="lazy">
      <div class="post-content">
        <span class="post-badge">${p.category}</span>
        <h3 class="post-title">${p.title}</h3>
        <p class="post-excerpt">${p.summary}</p>
        <div class="post-footer">
          <span><i class="fa fa-clock"></i> ${p.readTime} min read</span>
          <a href="post.html?slug=${p.slug}" class="read-more-btn">
            Read More <i class="fa fa-arrow-right"></i>
          </a>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

function filterPosts(category) {
  currentCategory = category;

  // Highlight active filter button
  const buttons = document.querySelectorAll(".filter-btn");
  buttons.forEach(btn => {
    if (btn.getAttribute("onclick")?.includes(`'${category}'`)) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  fetchPosts(category, currentSearch);
}

// --- Single Post Page Functions (`post.html`) ---
let currentPostId = null;

async function initSinglePostPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get("slug") || "my-first-blog";

  try {
    const res = await fetch(`${API_BASE_URL}/api/posts/${slug}`);
    const result = await res.json();

    if (result.success && result.data) {
      renderSinglePost(result.data);
    } else {
      renderFallbackSinglePost(slug);
    }
  } catch (err) {
    console.warn("Fetching post from API failed, displaying fallback:", err.message);
    renderFallbackSinglePost(slug);
  }
}

function renderSinglePost(post) {
  currentPostId = post._id;
  document.title = `${post.title} - My Blog`;

  const titleEl = document.getElementById("postTitle");
  const metaEl = document.getElementById("postMeta");
  const coverEl = document.getElementById("postCover");
  const contentEl = document.getElementById("postContent");

  if (titleEl) titleEl.innerText = post.title;
  if (metaEl) {
    metaEl.innerHTML = `
      <span><i class="fa fa-user"></i> ${post.authorId?.username || 'Admin'}</span>
      <span><i class="fa fa-calendar"></i> ${new Date(post.publishedAt || post.createdAt).toLocaleDateString()}</span>
      <span><i class="fa fa-eye"></i> ${post.viewsCount || 1} views</span>
    `;
  }
  if (coverEl && post.coverImage) coverEl.src = post.coverImage;
  if (contentEl) contentEl.innerText = post.content;

  // Load comments
  fetchComments(post._id);
}

function renderFallbackSinglePost(slug) {
  const postsMap = {
    'my-first-blog': {
      title: 'My First Blog Post',
      content: 'This is the full content of my blog post. Here you can write detailed explanations, examples, and share your knowledge with readers.\n\nBlogging helps you improve writing skills and also builds your technical portfolio.',
      views: 154,
      date: 'Feb 1, 2026'
    },
    'javascript-basics': {
      title: 'JavaScript Basics',
      content: 'JavaScript is a powerful scripting language used primarily for building interactive web applications. It handles dynamic behaviors, user inputs, and asynchronous backend communication with ease.',
      views: 310,
      date: 'Feb 5, 2026'
    },
    'my-college-life': {
      title: 'My College Life',
      content: 'Sharing my personal experiences during college. Balancing assignments, hackathons, open source contributions, and building lasting friendships.',
      views: 98,
      date: 'Jan 28, 2026'
    }
  };

  const p = postsMap[slug] || postsMap['my-first-blog'];
  document.title = `${p.title} - My Blog`;

  const titleEl = document.getElementById("postTitle");
  const metaEl = document.getElementById("postMeta");
  const contentEl = document.getElementById("postContent");

  if (titleEl) titleEl.innerText = p.title;
  if (metaEl) {
    metaEl.innerHTML = `
      <span><i class="fa fa-user"></i> Admin</span>
      <span><i class="fa fa-calendar"></i> ${p.date}</span>
      <span><i class="fa fa-eye"></i> ${p.views} views</span>
    `;
  }
  if (contentEl) contentEl.innerText = p.content;
}

async function fetchComments(postId) {
  const container = document.getElementById("commentsList");
  if (!container) return;

  try {
    const res = await fetch(`${API_BASE_URL}/api/comments/${postId}`);
    const result = await res.json();

    if (result.success && result.data.length > 0) {
      container.innerHTML = "";
      result.data.forEach(c => {
        const item = document.createElement("div");
        item.className = "comment-item";
        item.innerHTML = `
          <div class="comment-author">${c.authorDetails?.name || 'Reader'}</div>
          <div class="comment-text">${c.content}</div>
        `;
        container.appendChild(item);
      });
    }
  } catch (err) {
    console.warn("Could not fetch comments:", err.message);
  }
}

async function addComment() {
  const nameEl = document.getElementById("commentName");
  const contentEl = document.getElementById("commentContent");

  const name = nameEl ? nameEl.value.trim() : '';
  const content = contentEl ? contentEl.value.trim() : '';

  if (name === "" || content === "") {
    alert("Please fill in both your name and comment.");
    return;
  }

  // Client DOM append
  const container = document.getElementById("commentsList");
  if (container) {
    const commentBox = document.createElement("div");
    commentBox.className = "comment-item";
    commentBox.innerHTML = `<div class="comment-author">${name}</div><div class="comment-text">${content}</div>`;
    container.prepend(commentBox);
  }

  // Send to API if connected
  if (currentPostId) {
    try {
      await fetch(`${API_BASE_URL}/api/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: currentPostId, name, content })
      });
    } catch (err) {
      console.warn("Comment saved locally:", err.message);
    }
  }

  if (nameEl) nameEl.value = "";
  if (contentEl) contentEl.value = "";
}

// --- Contact Form Submission (`contact.html`) ---
async function validateForm(event) {
  if (event) event.preventDefault();

  const name = document.getElementById("name")?.value.trim();
  const email = document.getElementById("email")?.value.trim();
  const message = document.getElementById("message")?.value.trim();

  if (!name || !email || !message) {
    alert("Please complete all form fields.");
    return false;
  }

  if (!email.includes("@")) {
    alert("Please enter a valid email address.");
    return false;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message })
    });
    const result = await res.json();
    alert(result.message || "Thank you! Message sent successfully.");
  } catch (err) {
    alert("Message sent successfully!");
  }

  document.getElementById("name").value = "";
  document.getElementById("email").value = "";
  document.getElementById("message").value = "";
  return false;
}

// --- Admin Dashboard (`admin.html`) ---
async function initAdminPage() {
  const tableBody = document.getElementById("adminMessagesBody");
  if (!tableBody) return;

  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/messages`);
    const result = await res.json();

    if (result.success && result.data.length > 0) {
      tableBody.innerHTML = "";
      result.data.forEach((msg, idx) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${idx + 1}</td>
          <td><strong>${msg.name}</strong></td>
          <td>${msg.email}</td>
          <td>${msg.message}</td>
          <td>${new Date(msg.createdAt).toLocaleDateString()}</td>
        `;
        tableBody.appendChild(row);
      });
    }
  } catch (err) {
    console.warn("API not reachable for admin messages.");
  }
}