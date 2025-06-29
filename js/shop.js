// Shop items data
const shopItems = {
    avatars: [
        { id: 'avatar1', name: 'Cool Guy', price: 20, emoji: '😎', description: 'Look cool with these sunglasses' },
        { id: 'avatar2', name: 'Superhero', price: 30, emoji: '🦸', description: 'Become a superhero' },
        { id: 'avatar3', name: 'Wizard', price: 25, emoji: '🧙', description: 'Cast magical spells' },
        { id: 'avatar4', name: 'Robot', price: 40, emoji: '🤖', description: 'Beep boop beep' },
        { id: 'avatar5', name: 'Alien', price: 35, emoji: '👽', description: 'From out of this world' }
    ],
    badges: [
        { id: 'badge1', name: 'Pro Player', price: 50, emoji: '🏆', description: 'Show off your skills' },
        { id: 'badge2', name: 'Helper', price: 30, emoji: '🛟', description: 'For helpful community members' },
        { id: 'badge3', name: 'VIP', price: 100, emoji: '⭐', description: 'Exclusive VIP status' }
    ],
    games: [
        { id: 'game1', name: 'Double Coins', price: 200, emoji: '💰', description: 'Earn double coins in games' },
        { id: 'game2', name: 'Rainbow Trail', price: 150, emoji: '🌈', description: 'Leave a colorful trail' },
        { id: 'game3', name: 'Fly Power', price: 300, emoji: '🦅', description: 'Fly in supported games' }
    ]
};

function showCategory(category) {
    // Update active button
    document.querySelectorAll('.shop-categories button').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    // Display items
    const items = shopItems[category] || [];
    const shopItemsDiv = document.getElementById('shop-items');

    shopItemsDiv.innerHTML = items.map(item => {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const hasItem = currentUser.inventory && currentUser.inventory.some(i => i.id === item.id);

        return `
            <div class="shop-item">
                <div class="item-emoji">${item.emoji}</div>
                <h3>${item.name}</h3>
                <p>${item.description}</p>
                <div class="item-price">${item.price} coins</div>

                ${hasItem ? 
                    '<div class="owned-label">Owned</div>' : 
                    `<button onclick="buyItem('${category}', '${item.id}')" 
                      ${currentUser.coins < item.price ? 'disabled' : ''}>
                        Buy Now
                    </button>`
                }
            </div>
        `;
    }).join('');
}

function buyItem(category, itemId) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const item = shopItems[category].find(i => i.id === itemId);

    if(!item) {
        alert('Item not found');
        return;
    }

    if(currentUser.coins < item.price) {
        alert('Not enough coins');
        return;
    }

    if(!confirm(`Buy ${item.name} for ${item.price} coins?`)) return;

    // Deduct coins
    removeCoins(currentUser.username, item.price, `Purchased ${item.name}`);

    // Add to inventory
    let users = JSON.parse(localStorage.getItem('users'));
    const userIndex = users.findIndex(u => u.username === currentUser.username);

    if(userIndex !== -1) {
        if(!users[userIndex].inventory) users[userIndex].inventory = [];
        users[userIndex].inventory.push(item);
        users[userIndex].coins -= item.price;
        localStorage.setItem('users', JSON.stringify(users));

        // Update current user
        currentUser.inventory = users[userIndex].inventory;
        currentUser.coins -= item.price;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        // Update UI
        document.getElementById('coins-display').textContent = `Coins: ${currentUser.coins}`;
        showCategory(category);
        loadInventory();

        alert(`You bought ${item.name}!`);
    }
}

function loadInventory() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const inventoryDiv = document.getElementById('user-inventory');

    if(!currentUser.inventory || currentUser.inventory.length === 0) {
        inventoryDiv.innerHTML = '<p>Your inventory is empty. Buy some items from the shop!</p>';
        return;
    }

    inventoryDiv.innerHTML = currentUser.inventory.map(item => `
        <div class="inventory-item">
            <div class="item-emoji">${item.emoji}</div>
            <div class="item-info">
                <h4>${item.name}</h4>
                <p>${item.description}</p>
            </div>
            ${item.emoji.length === 1 ? `<button onclick="useAvatar('${item.emoji}')">Use Avatar</button>` : ''}
        </div>
    `).join('');
}

function useAvatar(emoji) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    let users = JSON.parse(localStorage.getItem('users'));
    const userIndex = users.findIndex(u => u.username === currentUser.username);

    if(userIndex !== -1) {
        users[userIndex].avatar = emoji;
        localStorage.setItem('users', JSON.stringify(users));

        // Update current user
        currentUser.avatar = emoji;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        alert(`Avatar changed to ${emoji}!`);
    }
}