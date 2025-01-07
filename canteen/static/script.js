let cart = [];  // Array to store items in the cart

// Function to search for items from the menu API
function searchItems() {
    const query = document.getElementById("search-bar").value;
    fetch('/menu/?search=' + query)
        .then(response => response.json())
        .then(data => {
            const menu = data.menu;
            displayMenu(menu);
        })
        .catch(error => console.error('Error fetching menu:', error));
}

// Function to display menu items in the table
function displayMenu(menu) {
    const menuItems = document.getElementById("menu-items");
    menuItems.innerHTML = "";  // Clear existing rows

    menu.forEach(item => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${item.item_id}</td>
            <td>${item.name}</td>
            <td>${item.price}</td>
            <td>${item.stock}</td>
            <td><button onclick="addToCart('${item.item_id}', '${item.name}', ${item.price}, ${item.stock})">Add to Cart</button></td>
        `;
        menuItems.appendChild(row);
    });
}

// Function to add an item to the cart
function addToCart(itemId, itemName, itemPrice, stock) {
    const quantity = 1;  // Default quantity
    const cartItem = {
        itemId,
        itemName,
        itemPrice,
        quantity,
        total: itemPrice * quantity
    };
    
    // Check if item already exists in the cart
    const existingItem = cart.find(item => item.itemId === itemId);
    if (existingItem) {
        // Update quantity if item is already in the cart
        existingItem.quantity += 1;
        existingItem.total = existingItem.itemPrice * existingItem.quantity;
    } else {
        cart.push(cartItem);
    }

    displayCart();
}

// Function to display items in the cart
function displayCart() {
    const cartItems = document.getElementById("cart-items");
    cartItems.innerHTML = "";  // Clear existing rows

    cart.forEach((item, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${item.itemName}</td>
            <td><input type="number" value="${item.quantity}" min="1" onchange="updateCartQuantity(${index}, this.value)"></td>
            <td><input type="number" value="${item.itemPrice}" min="1" onchange="updateCartPrice(${index}, this.value)"></td>
            <td>${item.total}</td>
            <td><button onclick="removeFromCart(${index})">Remove</button></td>
        `;
        cartItems.appendChild(row);
    });

    updateTotal();
}

// Function to update the quantity of an item in the cart
function updateCartQuantity(index, newQuantity) {
    cart[index].quantity = newQuantity;
    cart[index].total = cart[index].itemPrice * newQuantity;
    displayCart();
}

// Function to update the price of an item in the cart
function updateCartPrice(index, newPrice) {
    cart[index].itemPrice = newPrice;
    cart[index].total = cart[index].quantity * newPrice;
    displayCart();
}

// Function to remove an item from the cart
function removeFromCart(index) {
    cart.splice(index, 1);
    displayCart();
}

// Function to update the total amount of the cart
function updateTotal() {
    const totalAmount = cart.reduce((total, item) => total + item.total, 0);
    document.getElementById("total-amount").innerText = totalAmount;
}
