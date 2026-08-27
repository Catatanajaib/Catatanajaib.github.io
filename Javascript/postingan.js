document.addEventListener('DOMContentLoaded', () => {
  const STORAGE_KEY = 'temp_posts_data';
  const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;
  const postsFeed = document.getElementById('postsFeed');
  const postForm = document.getElementById('postForm');

  function escapeHtml(text) {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function loadPosts() {
    if (!postsFeed) return;
    
    const savedPosts = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const now = new Date().getTime();
    const activePosts = savedPosts.filter(post => (now - post.createdAt) < THREE_DAYS_MS);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(activePosts));

    if (activePosts.length === 0) {
      postsFeed.innerHTML = '<p>Belum ada postingan aktif.</p>';
      return;
    }

    postsFeed.innerHTML = activePosts.map(post => {
      const dateString = new Date(post.createdAt).toLocaleString('id-ID');
      const sisaWaktuJam = Math.round((THREE_DAYS_MS - (now - post.createdAt)) / (1000 * 60 * 60));
      
      return `
        <div class="post-card" style="border-radius:3px;">
          <div class="post-meta">
            <strong>${escapeHtml(post.username)}</strong> • ${dateString} 
            <span class="badge">Hangus -${sisaWaktuJam} jam</span>
          </div>
          <div style="padding: 10px;">${escapeHtml(post.content)}</div>
        </div>
      `;
    }).join('');
  }

  if (postForm) {
    postForm.addEventListener('submit', function(e) {
      e.preventDefault();

      const username = document.getElementById('username').value.trim();
      const content = document.getElementById('content').value.trim();

      if (!username || !content) return;

      const newPost = {
        id: Date.now(),
        username: username,
        content: content,
        createdAt: new Date().getTime()
      };

      const savedPosts = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      savedPosts.unshift(newPost);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedPosts));

      postForm.reset();
      loadPosts();
    });
  }

  loadPosts();
});
