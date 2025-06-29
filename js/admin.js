function loadAdminUsers() {
  const users = JSON.parse(localStorage.getItem('users')) || [];
  const adminUsersList = document.getElementById('admin-users-list');

  adminUsersList.innerHTML = users.map(user => {
      const isBanned = user.banned && new Date(user.bannedUntil) > new Date();

      return `
          <div class="admin-user-card ${isBanned ? 'banned' : ''}">
              <div class="user-avatar">${user.avatar || '👤'}</div>
              <div class="user-info">
                  <h4>${user.username}</h4>
                  <p>Coins: ${user.coins}</p>
                  <p>Joined: ${new Date(user.joinedDate).toLocaleDateString()}</p>
                  ${isBanned ? `<p class="banned-label">Banned until ${new Date(user.bannedUntil).toLocaleDateString()}</p>` : ''}
              </div>
              <div class="admin-actions">
                  <input type="number" id="coins-${user.username}" placeholder="Set coins" value="${user.coins}">
                  <button onclick="adminSetCoins('${user.username}')">Update</button>
                  ${isBanned ? 
                      `<button onclick="adminUnbanUser('${user.username}')" class="unban-btn">Unban</button>` : 
                      `<button onclick="adminBanUser('${user.username}')" class="ban-btn">Ban</button>`
                  }
                  <button onclick="adminDeleteUser('${user.username}')" class="danger">Delete</button>
              </div>
          </div>
      `;
  }).join('');
}

function adminSearchUsers() {
  const searchTerm = document.getElementById('admin-user-search').value.toLowerCase();
  const users = JSON.parse(localStorage.getItem('users')) || [];

  if(searchTerm.trim() === '') {
      loadAdminUsers();
      return;
  }

  const filteredUsers = users.filter(user => 
      user.username.toLowerCase().includes(searchTerm));

  const adminUsersList = document.getElementById('admin-users-list');
  adminUsersList.innerHTML = filteredUsers.map(user => {
      const isBanned = user.banned && new Date(user.bannedUntil) > new Date();

      return `
          <div class="admin-user-card ${isBanned ? 'banned' : ''}">
              <div class="user-avatar">${user.avatar || '👤'}</div>
              <div class="user-info">
                  <h4>${user.username}</h4>
                  <p>Coins: ${user.coins}</p>
                  <p>Joined: ${new Date(user.joinedDate).toLocaleDateString()}</p>
                  ${isBanned ? `<p class="banned-label">Banned until ${new Date(user.bannedUntil).toLocaleDateString()}</p>` : ''}
              </div>
              <div class="admin-actions">
                  <input type="number" id="coins-${user.username}" placeholder="Set coins" value="${user.coins}">
                  <button onclick="adminSetCoins('${user.username}')">Update</button>
                  ${isBanned ? 
                      `<button onclick="adminUnbanUser('${user.username}')" class="unban-btn">Unban</button>` : 
                      `<button onclick="adminBanUser('${user.username}')" class="ban-btn">Ban</button>`
                  }
                  <button onclick="adminDeleteUser('${user.username}')" class="danger">Delete</button>
              </div>
          </div>
      `;
  }).join('');
}

function adminSetCoins(username) {
  const newCoins = parseInt(document.getElementById(`coins-${username}`).value);

  if(isNaN(newCoins)) {
      alert('Please enter a valid number');
      return;
  }

  let users = JSON.parse(localStorage.getItem('users'));
  const userIndex = users.findIndex(u => u.username === username);

  if(userIndex !== -1) {
      const difference = newCoins - users[userIndex].coins;
      users[userIndex].coins = newCoins;
      localStorage.setItem('users', JSON.stringify(users));

      // Record transaction
      recordTransaction(username, difference, `Admin adjustment`);

      // If modifying current user, update their local data
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if(currentUser.username === username) {
          currentUser.coins = newCoins;
          localStorage.setItem('currentUser', JSON.stringify(currentUser));
          document.getElementById('coins-display').textContent = `Coins: ${currentUser.coins}`;
      }

      alert(`Updated ${username}'s coins to ${newCoins}`);
  }
}

function adminBanUser(username) {
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
      recordTransaction(username, 0, `Banned for ${days} days by admin`);

      alert(`${username} has been banned until ${banDate.toLocaleDateString()}`);
      loadAdminUsers();
  }
}

function adminUnbanUser(username) {
  if(!confirm(`Unban ${username}?`)) return;

  let users = JSON.parse(localStorage.getItem('users'));
  const userIndex = users.findIndex(u => u.username === username);

  if(userIndex !== -1) {
      users[userIndex].bannedUntil = null;
      localStorage.setItem('users', JSON.stringify(users));

      // Record transaction
      recordTransaction(username, 0, `Unbanned by admin`);

      alert(`${username} has been unbanned`);
      loadAdminUsers();
  }
}

function adminDeleteUser(username) {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if(username === currentUser.username) {
      alert('You cannot delete your own account');
      return;
  }

  if(!confirm(`Permanently delete ${username} and all their data?`)) return;

  let users = JSON.parse(localStorage.getItem('users'));
  users = users.filter(u => u.username !== username);
  localStorage.setItem('users', JSON.stringify(users));

  // Remove their posts from forums
  let forumPosts = JSON.parse(localStorage.getItem('forumPosts'));
  forumPosts = forumPosts.filter(post => post.author !== username);
  localStorage.setItem('forumPosts', JSON.stringify(forumPosts));

  alert(`${username} has been deleted`);
  loadAdminUsers();
}

function loadRecentActivity() {
  const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
  const recentActivity = document.getElementById('recent-activity');

  recentActivity.innerHTML = transactions
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 20)
      .map(t => `
          <div class="activity-item">
              <span class="activity-date">${new Date(t.date).toLocaleString()}</span>
              <span class="activity-user">${t.username}</span>
              <span class="activity-action">${t.reason}</span>
              ${t.amount !== 0 ? `<span class="activity-amount ${t.amount > 0 ? 'positive' : 'negative'}">
                  ${t.amount > 0 ? '+' : ''}${t.amount} coins
              </span>` : ''}
          </div>
      `).join('');
}

function resetAllData() {
  if(!confirm('WARNING: This will delete ALL data and cannot be undone. Continue?')) return;

  localStorage.clear();
  initializeData();
  alert('All data has been reset. You will now be logged out.');
  logout();
}