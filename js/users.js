function loadUsers() {
  const sortBy = document.getElementById('sort-by').value;
  const users = JSON.parse(localStorage.getItem('users')) || [];
  const forumPosts = JSON.parse(localStorage.getItem('forumPosts')) || [];
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));

  let sortedUsers = [...users];

  switch(sortBy) {
      case 'recent':
          sortedUsers.sort((a, b) => new Date(b.joinedDate) - new Date(a.joinedDate));
          break;
      case 'coins':
          sortedUsers.sort((a, b) => b.coins - a.coins);
          break;
      case 'posts':
          sortedUsers.sort((a, b) => {
              const aPosts = forumPosts.filter(p => p.author === a.username).length;
              const bPosts = forumPosts.filter(p => p.author === b.username).length;
              return bPosts - aPosts;
          });
          break;
  }

  displayUsers(sortedUsers);
}

function searchUsers() {
  const searchTerm = document.getElementById('user-search').value.toLowerCase();
  const users = JSON.parse(localStorage.getItem('users')) || [];

  if(searchTerm.trim() === '') {
      loadUsers();
      return;
  }

  const filteredUsers = users.filter(user => 
      user.username.toLowerCase().includes(searchTerm));

  displayUsers(filteredUsers);
}

function displayUsers(users) {
  const usersList = document.getElementById('users-list');
  const forumPosts = JSON.parse(localStorage.getItem('forumPosts')) || [];
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));

  usersList.innerHTML = users.map(user => {
      const postCount = forumPosts.filter(p => p.author === user.username).length;
      const isBanned = user.banned && new Date(user.bannedUntil) > new Date();

      return `
          <div class="user-card ${isBanned ? 'banned' : ''}">
              <div class="user-avatar">${user.avatar || '👤'}</div>
              <h3><a href="profile.html?user=${user.username}">${user.username}</a></h3>
              <p>Coins: ${user.coins}</p>
              <p>Posts: ${postCount}</p>
              <p>Joined: ${new Date(user.joinedDate).toLocaleDateString()}</p>
              ${isBanned ? `<p class="banned-label">Banned until ${new Date(user.bannedUntil).toLocaleDateString()}</p>` : ''}

              ${currentUser.isAdmin && currentUser.username !== user.username ? `
                  <div class="admin-actions">
                      <button onclick="banPrompt('${user.username}')" class="ban-btn">Ban</button>
                      ${isBanned ? `<button onclick="unbanUser('${user.username}')" class="unban-btn">Unban</button>` : ''}
                  </div>
              ` : ''}
          </div>
      `;
  }).join('');
}

function banPrompt(username) {
  const days = prompt(`Ban ${username} for how many days?`);
  if(!days || isNaN(days)) return;

  let users = JSON.parse(localStorage.getItem('users'));
  const userIndex = users.findIndex(u => u.username === username);

  if(userIndex !== -1) {
      const banDate = new Date();
      banDate.setDate(banDate.getDate() + parseInt(days));

      users[userIndex].bannedUntil = banDate.toISOString();
      localStorage.setItem('users', JSON.stringify(users));

      // Record transaction
      const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
      transactions.push({
          username,
          amount: 0,
          reason: `Banned for ${days} days by admin`,
          date: new Date().toISOString()
      });
      localStorage.setItem('transactions', JSON.stringify(transactions));

      alert(`${username} has been banned until ${banDate.toLocaleDateString()}`);
      loadUsers();
  }
}

function unbanUser(username) {
  if(!confirm(`Unban ${username}?`)) return;

  let users = JSON.parse(localStorage.getItem('users'));
  const userIndex = users.findIndex(u => u.username === username);

  if(userIndex !== -1) {
      users[userIndex].bannedUntil = null;
      localStorage.setItem('users', JSON.stringify(users));

      // Record transaction
      const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
      transactions.push({
          username,
          amount: 0,
          reason: `Unbanned by admin`,
          date: new Date().toISOString()
      });
      localStorage.setItem('transactions', JSON.stringify(transactions));

      alert(`${username} has been unbanned`);
      loadUsers();
  }
}