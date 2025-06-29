// profile.js - Complete Fixed Version

// Load profile data


function loadProfile() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const urlParams = new URLSearchParams(window.location.search);
    const profileUsername = urlParams.get('user') || currentUser.username;

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const profileUser = users.find(u => u.username === profileUsername);

    if (!profileUser) {
        window.location.href = 'profile.html';
        return;
    }

    // Display profile info
    document.getElementById('profile-username').textContent = profileUser.username;
    document.getElementById('profile-avatar-large').textContent = profileUser.avatar || '👤';
    document.getElementById('profile-stat-coins').textContent = profileUser.coins;
    document.getElementById('join-date').textContent = new Date(profileUser.joinedDate).toLocaleDateString();

    // Count user's posts
    const forumPosts = JSON.parse(localStorage.getItem('forumPosts')) || [];
    const userPosts = forumPosts.filter(post => post.author === profileUsername).length;
    document.getElementById('profile-stat-posts').textContent = userPosts;

    // Temporary friends count
    document.getElementById('profile-stat-friends').textContent = '0';

    // Show change avatar button only for current user's profile
    if (currentUser.username === profileUsername) {
        document.getElementById('avatar-edit-btn').style.display = 'block';
    } else {
        document.getElementById('avatar-edit-btn').style.display = 'none';
    }

    // Admin controls
    if (currentUser.isAdmin && currentUser.username !== profileUsername) {
        document.getElementById('admin-controls').style.display = 'block';
        document.getElementById('admin-coins-input').value = profileUser.coins;

        // Set ban days input if user is banned
        if (profileUser.bannedUntil && new Date(profileUser.bannedUntil) > new Date()) {
            const banDays = Math.ceil((new Date(profileUser.bannedUntil) - new Date()) / (1000 * 60 * 60 * 24));
            document.getElementById('admin-ban-days').value = banDays;
        }
    } else {
        document.getElementById('admin-controls').style.display = 'none';
    }

    // Load recent activity
    loadRecentActivity(profileUsername);

    // Load user's posts
    loadUserPosts(profileUsername);
}

// Load recent activity
function loadRecentActivity(username) {
    const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    const userTransactions = transactions
        .filter(t => t.username === username)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

    const activityList = document.getElementById('profile-activity-list');

    if (userTransactions.length === 0) {
        activityList.innerHTML = '<div class="empty-activity">No recent activity found</div>';
        return;
    }

    activityList.innerHTML = userTransactions.map(t => `
        <div class="activity-item">
            <div class="activity-icon">
                ${t.amount > 0 ? '<i class="fas fa-coins"></i>' : '<i class="fas fa-exchange-alt"></i>'}
            </div>
            <div class="activity-details">
                <p class="activity-description">${t.reason}</p>
                <span class="activity-date">${new Date(t.date).toLocaleString()}</span>
            </div>
            <div class="activity-amount ${t.amount > 0 ? 'positive' : 'neutral'}">
                ${t.amount > 0 ? '+' : ''}${t.amount}
            </div>
        </div>
    `).join('');
}

// Load user's posts
function loadUserPosts(username) {
    const forumPosts = JSON.parse(localStorage.getItem('forumPosts')) || [];
    const userPosts = forumPosts
        .filter(post => post.author === username)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

    const postsList = document.getElementById('profile-posts-list');

    if (userPosts.length === 0) {
        postsList.innerHTML = '<div class="empty-posts">No posts yet</div>';
        return;
    }

    postsList.innerHTML = userPosts.map(post => `
        <div class="post-item">
            <h4><a href="forums.html#post-${forumPosts.indexOf(post)}">${post.title}</a></h4>
            <p class="post-excerpt">${post.content.substring(0, 100)}${post.content.length > 100 ? '...' : ''}</p>
            <div class="post-meta">
                <span class="post-date">${new Date(post.date).toLocaleDateString()}</span>
                <span class="post-replies">${post.replies?.length || 0} replies</span>
            </div>
        </div>
    `).join('');
}

// Change avatar function
function changeAvatar() {
    const avatars = ['👤', '👨', '👩', '🧑', '👦', '👧', '🦸', '🦹', '🧙', '🧛', '🐱', '🐶', '🦊', '🐻', '🐮', '🤖', '👽'];
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    const newAvatar = prompt('Choose an emoji avatar:\n' + avatars.join(' '));
    if (newAvatar && avatars.includes(newAvatar)) {
        let users = JSON.parse(localStorage.getItem('users'));
        const userIndex = users.findIndex(u => u.username === currentUser.username);

        if (userIndex !== -1) {
            users[userIndex].avatar = newAvatar;
            localStorage.setItem('users', JSON.stringify(users));

            // Update current user
            currentUser.avatar = newAvatar;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));

            // Update UI without refresh
            document.getElementById('profile-avatar-large').textContent = newAvatar;
            document.getElementById('sidebar-avatar').textContent = newAvatar;

            // Add animation
            const avatarElement = document.getElementById('profile-avatar-large');
            avatarElement.classList.add('avatar-updated');
            setTimeout(() => {
                avatarElement.classList.remove('avatar-updated');
            }, 1000);
        }
    } else if (newAvatar) {
        alert('Please select a valid emoji from the list');
    }
}

// Admin functions
function adminSetCoins() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser.isAdmin) return;

    const urlParams = new URLSearchParams(window.location.search);
    const profileUsername = urlParams.get('user');
    const newCoins = parseInt(document.getElementById('admin-coins-input').value);

    if (isNaN(newCoins)) {
        alert('Please enter a valid number');
        return;
    }

    let users = JSON.parse(localStorage.getItem('users'));
    const userIndex = users.findIndex(u => u.username === profileUsername);

    if (userIndex !== -1) {
        const difference = newCoins - users[userIndex].coins;
        users[userIndex].coins = newCoins;
        localStorage.setItem('users', JSON.stringify(users));

        // Record transaction
        recordTransaction(profileUsername, difference, `Admin adjustment by ${currentUser.username}`);

        // Update UI without refresh
        document.getElementById('profile-stat-coins').textContent = newCoins;
        document.getElementById('admin-coins-input').value = newCoins;

        // If viewing own profile, update currentUser
        if (currentUser.username === profileUsername) {
            currentUser.coins = newCoins;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            document.getElementById('sidebar-coins').textContent = `${newCoins} coins`;
        }

        showToast('Coins updated successfully');
    }
}

function adminBanUser() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser.isAdmin) return;

    const urlParams = new URLSearchParams(window.location.search);
    const profileUsername = urlParams.get('user');
    const banDays = parseInt(document.getElementById('admin-ban-days').value);

    if (isNaN(banDays) || banDays <= 0) {
        alert('Please enter a valid number of days');
        return;
    }

    if (!confirm(`Ban ${profileUsername} for ${banDays} days?`)) return;

    let users = JSON.parse(localStorage.getItem('users'));
    const userIndex = users.findIndex(u => u.username === profileUsername);

    if (userIndex !== -1) {
        const banDate = new Date();
        banDate.setDate(banDate.getDate() + banDays);

        users[userIndex].bannedUntil = banDate.toISOString();
        localStorage.setItem('users', JSON.stringify(users));

        // Record transaction
        recordTransaction(profileUsername, 0, `Banned for ${banDays} days by admin`);

        showToast(`${profileUsername} has been banned until ${banDate.toLocaleDateString()}`);
    }
}

function adminUnbanUser() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser.isAdmin) return;

    const urlParams = new URLSearchParams(window.location.search);
    const profileUsername = urlParams.get('user');

    if (!confirm(`Unban ${profileUsername}?`)) return;

    let users = JSON.parse(localStorage.getItem('users'));
    const userIndex = users.findIndex(u => u.username === profileUsername);

    if (userIndex !== -1) {
        users[userIndex].bannedUntil = null;
        localStorage.setItem('users', JSON.stringify(users));

        // Record transaction
        recordTransaction(profileUsername, 0, `Unbanned by admin`);

        // Clear ban days input
        document.getElementById('admin-ban-days').value = '';

        showToast(`${profileUsername} has been unbanned`);
    }
}

// Helper function to record transactions
function recordTransaction(username, amount, reason) {
    const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    transactions.push({
        username,
        amount,
        reason,
        date: new Date().toISOString()
    });
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Show toast notification
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('show');
    }, 100);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// Initialize profile when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadProfile();

    // Set active tab based on URL hash
    const hash = window.location.hash.substring(1);
    if (hash === 'posts' || hash === 'activity') {
        showProfileTab(hash);
    }
});

// Profile tab switching
function showProfileTab(tabName) {
    // Update URL hash
    window.location.hash = tabName;

    // Hide all tab contents
    document.querySelectorAll('.profile-tab-content').forEach(tab => {
        tab.classList.remove('active');
    });

    // Deactivate all tabs
    document.querySelectorAll('.profile-tab').forEach(tab => {
        tab.classList.remove('active');
    });

    // Activate selected tab
    document.getElementById(`${tabName}-tab`).classList.add('active');
    document.querySelector(`.profile-tab[onclick="showProfileTab('${tabName}')"]`).classList.add('active');
}