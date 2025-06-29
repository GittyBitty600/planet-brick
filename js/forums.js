function loadForumPosts() {
  const posts = JSON.parse(localStorage.getItem('forumPosts')) || [];
  const forumPosts = document.getElementById('forum-posts');
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));

  forumPosts.innerHTML = posts.map((post, index) => {
      const replies = post.replies || [];

      return `
          <div class="forum-post" id="post-${index}">
              <h3>${post.title}</h3>
              <div class="post-meta">
                  Posted by <a href="profile.html?user=${post.author}">${post.author}</a> 
                  on ${new Date(post.date).toLocaleString()}
              </div>
              <div class="post-content">${post.content}</div>

              <div class="post-actions">
                  <button onclick="toggleReplies(${index})">
                      ${replies.length} ${replies.length === 1 ? 'reply' : 'replies'}
                  </button>
                  ${currentUser.isAdmin || currentUser.username === post.author ? 
                      `<button onclick="deletePost(${index})" class="delete-btn">Delete</button>` : ''}
              </div>

              <div class="replies" id="replies-${index}" style="display: none;">
                  ${replies.map(reply => `
                      <div class="reply">
                          <div class="reply-meta">
                              <a href="profile.html?user=${reply.author}">${reply.author}</a> 
                              replied on ${new Date(reply.date).toLocaleString()}
                          </div>
                          <div class="reply-content">${reply.content}</div>
                      </div>
                  `).join('')}

                  <div class="add-reply">
                      <textarea id="reply-content-${index}" placeholder="Write a reply..."></textarea>
                      <button onclick="addReply(${index})">Post Reply</button>
                  </div>
              </div>
          </div>
      `;
  }).join('');
}

function toggleReplies(postIndex) {
  const repliesDiv = document.getElementById(`replies-${postIndex}`);
  if(repliesDiv.style.display === 'none') {
      repliesDiv.style.display = 'block';
  } else {
      repliesDiv.style.display = 'none';
  }
}

function createPost() {
  const title = document.getElementById('post-title').value.trim();
  const content = document.getElementById('post-content').value.trim();
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));

  if(!title || !content) {
      alert('Please fill both title and content');
      return;
  }

  let posts = JSON.parse(localStorage.getItem('forumPosts')) || [];
  const newPost = {
      title,
      content,
      author: currentUser.username,
      date: new Date().toISOString(),
      replies: []
  };

  posts.unshift(newPost); // Add to beginning
  localStorage.setItem('forumPosts', JSON.stringify(posts));

  // Add to user's posts
  let users = JSON.parse(localStorage.getItem('users'));
  const userIndex = users.findIndex(u => u.username === currentUser.username);
  if(userIndex !== -1) {
      if(!users[userIndex].posts) users[userIndex].posts = [];
      users[userIndex].posts.push(newPost);
      localStorage.setItem('users', JSON.stringify(users));
  }

  // Clear inputs and reload posts
  document.getElementById('post-title').value = '';
  document.getElementById('post-content').value = '';
  loadForumPosts();

  // Reward user for posting
  addCoins(currentUser.username, 2, 'Forum post creation');
  document.getElementById('coins-display').textContent = `Coins: ${currentUser.coins + 2}`;
}

function addReply(postIndex) {
  const content = document.getElementById(`reply-content-${postIndex}`).value.trim();
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));

  if(!content) {
      alert('Please enter reply content');
      return;
  }

  let posts = JSON.parse(localStorage.getItem('forumPosts'));
  if(!posts || !posts[postIndex]) return;

  const newReply = {
      author: currentUser.username,
      content,
      date: new Date().toISOString()
  };

  if(!posts[postIndex].replies) {
      posts[postIndex].replies = [];
  }

  posts[postIndex].replies.push(newReply);
  localStorage.setItem('forumPosts', JSON.stringify(posts));

  // Clear reply input and show replies
  document.getElementById(`reply-content-${postIndex}`).value = '';
  document.getElementById(`replies-${postIndex}`).style.display = 'block';

  // Reward user for replying
  addCoins(currentUser.username, 1, 'Forum reply');
  document.getElementById('coins-display').textContent = `Coins: ${currentUser.coins + 1}`;
}

function deletePost(postIndex) {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const posts = JSON.parse(localStorage.getItem('forumPosts'));

  if(!currentUser || !posts || !posts[postIndex]) return;

  // Check if user is admin or post author
  if(!currentUser.isAdmin && currentUser.username !== posts[postIndex].author) {
      alert('You can only delete your own posts');
      return;
  }

  if(!confirm('Are you sure you want to delete this post?')) return;

  posts.splice(postIndex, 1);
  localStorage.setItem('forumPosts', JSON.stringify(posts));

  // Remove from user's posts if author
  if(currentUser.username === posts[postIndex]?.author) {
      let users = JSON.parse(localStorage.getItem('users'));
      const userIndex = users.findIndex(u => u.username === currentUser.username);
      if(userIndex !== -1) {
          users[userIndex].posts = users[userIndex].posts.filter(
              (_, index) => index !== postIndex
          );
          localStorage.setItem('users', JSON.stringify(users));
      }
  }

  loadForumPosts();
}