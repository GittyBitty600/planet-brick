// Coin system functionality

// Add coins to user
function addCoins(username, amount, reason) {
    let users = JSON.parse(localStorage.getItem('users'));
    const userIndex = users.findIndex(u => u.username === username);

    if(userIndex !== -1) {
        users[userIndex].coins += amount;
        localStorage.setItem('users', JSON.stringify(users));

        // Update current user if it's them
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if(currentUser && currentUser.username === username) {
            currentUser.coins += amount;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            if(document.getElementById('coins-display')) {
                document.getElementById('coins-display').textContent = `Coins: ${currentUser.coins}`;
            }
        }

        // Record transaction
        recordTransaction(username, amount, reason);
        return true;
    }
    return false;
}

// Remove coins from user
function removeCoins(username, amount, reason) {
    let users = JSON.parse(localStorage.getItem('users'));
    const userIndex = users.findIndex(u => u.username === username);

    if(userIndex !== -1 && users[userIndex].coins >= amount) {
        users[userIndex].coins -= amount;
        localStorage.setItem('users', JSON.stringify(users));

        // Update current user if it's them
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if(currentUser && currentUser.username === username) {
            currentUser.coins -= amount;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            if(document.getElementById('coins-display')) {
                document.getElementById('coins-display').textContent = `Coins: ${currentUser.coins}`;
            }
        }

        // Record transaction
        recordTransaction(username, -amount, reason);
        return true;
    }
    return false;
}

// Record a transaction
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

// Daily bonus system
function checkDailyBonus() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if(!currentUser) return;

    const lastClaim = currentUser.lastBonusClaim;
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    if(!lastClaim || lastClaim.split('T')[0] !== today) {
        document.getElementById('daily-bonus-container').style.display = 'block';
    }
}

function claimDailyBonus() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if(!currentUser) return;

    const now = new Date();
    const today = now.toISOString().split('T')[0];

    let users = JSON.parse(localStorage.getItem('users'));
    const userIndex = users.findIndex(u => u.username === currentUser.username);

    if(userIndex !== -1) {
        // Check if already claimed today
        if(users[userIndex].lastBonusClaim && users[userIndex].lastBonusClaim.split('T')[0] === today) {
            alert('You already claimed your bonus today!');
            return;
        }

        users[userIndex].coins += 5;
        users[userIndex].lastBonusClaim = now.toISOString();
        localStorage.setItem('users', JSON.stringify(users));

        // Update current user
        currentUser.coins += 5;
        currentUser.lastBonusClaim = now.toISOString();
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        document.getElementById('coins-display').textContent = `Coins: ${currentUser.coins}`;
        document.getElementById('daily-bonus-container').style.display = 'none';
        recordTransaction(currentUser.username, 5, 'Daily bonus');
        alert('You received 5 coins!');
    }
}