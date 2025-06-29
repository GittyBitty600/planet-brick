// Check if user is logged in and redirect
if(localStorage.getItem('currentUser') && window.location.pathname.endsWith('index.html')) {
    window.location.href = 'home.html';
}

// Show/hide login/signup forms
function showSignup() {
    document.getElementById('login-box').style.display = 'none';
    document.getElementById('signup-box').style.display = 'block';
}

function showLogin() {
    document.getElementById('signup-box').style.display = 'none';
    document.getElementById('login-box').style.display = 'block';
}

// Login function
function login() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.username === username);

    if(!user) {
        document.getElementById('login-error').textContent = 'User not found';
        return;
    }

    if(user.password !== password) {
        document.getElementById('login-error').textContent = 'Incorrect password';
        return;
    }

    if(user.banned && new Date(user.bannedUntil) > new Date()) {
        document.getElementById('login-error').textContent = `You are banned until ${new Date(user.bannedUntil).toLocaleDateString()}`;
        return;
    }

    localStorage.setItem('currentUser', JSON.stringify(user));
    window.location.href = 'home.html';
}

// Signup function
function signup() {
    const username = document.getElementById('signup-username').value;
    const password = document.getElementById('signup-password').value;

    if(!username || !password) {
        document.getElementById('signup-error').textContent = 'Please fill all fields';
        return;
    }

    if(username.length < 3 || username.length > 20) {
        document.getElementById('signup-error').textContent = 'Username must be 3-20 characters';
        return;
    }

    if(password.length < 6) {
        document.getElementById('signup-error').textContent = 'Password must be at least 6 characters';
        return;
    }

    let users = JSON.parse(localStorage.getItem('users')) || [];

    if(users.some(u => u.username === username)) {
        document.getElementById('signup-error').textContent = 'Username already taken';
        return;
    }

    const newUser = {
        username,
        password,
        coins: 10, // Starting coins
        joinedDate: new Date().toISOString(),
        posts: [],
        isAdmin: username.toLowerCase() === 'admin',
        avatar: '👤',
        lastLogin: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    window.location.href = 'home.html';
}

// Logout function
function logout() {
    // Update last login time before logging out
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if(currentUser) {
        let users = JSON.parse(localStorage.getItem('users'));
        const userIndex = users.findIndex(u => u.username === currentUser.username);
        if(userIndex !== -1) {
            users[userIndex].lastLogin = new Date().toISOString();
            localStorage.setItem('users', JSON.stringify(users));
        }
    }

    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// Check if user is banned
function checkBanStatus() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if(!currentUser) return false;

    if(currentUser.banned && new Date(currentUser.bannedUntil) > new Date()) {
        localStorage.removeItem('currentUser');
        alert(`You are banned until ${new Date(currentUser.bannedUntil).toLocaleDateString()}`);
        window.location.href = 'index.html';
        return true;
    }
    return false;
}