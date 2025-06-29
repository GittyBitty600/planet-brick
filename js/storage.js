// Initialize data if not exists
function initializeData() {
    if(!localStorage.getItem('users')) {
        const adminUser = {
            username: 'admin',
            password: 'admin123', // In production, never store plain passwords!
            coins: 1000,
            joinedDate: new Date().toISOString(),
            posts: [],
            isAdmin: true,
            avatar: '👑',
            lastLogin: new Date().toISOString()
        };

        localStorage.setItem('users', JSON.stringify([adminUser]));
    }

    if(!localStorage.getItem('forumPosts')) {
        localStorage.setItem('forumPosts', JSON.stringify([]));
    }

    if(!localStorage.getItem('transactions')) {
        localStorage.setItem('transactions', JSON.stringify([]));
    }
}

// Backup all data
function backupData() {
    const data = {
        users: localStorage.getItem('users'),
        forumPosts: localStorage.getItem('forumPosts'),
        transactions: localStorage.getItem('transactions'),
        version: '1.0',
        backupDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `roblox-clone-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
}

// Restore data from backup
function restoreData(event) {
    const file = event.target.files[0];
    if(!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);

            if(confirm('This will overwrite all current data. Continue?')) {
                localStorage.setItem('users', data.users);
                localStorage.setItem('forumPosts', data.forumPosts);
                localStorage.setItem('transactions', data.transactions);
                alert('Data restored successfully!');
                window.location.reload();
            }
        } catch (err) {
            alert('Error restoring backup: ' + err.message);
        }
    };
    reader.readAsText(file);
}

initializeData();