let cart = [];  // Array to store items in the cart

// Function to search for items from the menu API
function searchItems() {
    const query = document.getElementById("search-bar").value;
    if (query.length < 1) {
        document.getElementById("search-results").style.display = "none";
        return;
    }

    fetch('/menu/?search=' + query)
        .then(response => response.json())
        .then(data => {
            const menu = data.menu;
            displaySearchResults(menu);
        })
        .catch(error => console.error('Error fetching menu:', error));
}

// Function to display search results in the dropdown
function displaySearchResults(menu) {
    const searchResults = document.getElementById("search-results");
    searchResults.innerHTML = "";  // Clear existing results
    searchResults.style.display = "none";  // Hide dropdown if no results

    menu.forEach(item => {
        const li = document.createElement("li");
        li.innerHTML = `${item.name} - $${item.price}`;
        li.onclick = () => addToCart(item.item_id, item.name, item.price, item.stock);
        searchResults.appendChild(li);
    });

    if (menu.length > 0) {
        searchResults.style.display = "block";  // Show dropdown
    } else {
        searchResults.style.display = "none";  // Hide dropdown if no items found
    }
}

// Function to get CSRF token from the meta tag
function getCSRFToken() {
    const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
    return csrfToken;
}

// Function to add item to the cart
function addToCart(itemId, itemName, itemPrice, stock) {
    const quantity = 1;  // Default quantity
    const data = new FormData();
    data.append("item_id", itemId);
    data.append("quantity", quantity);

    fetch('/add_to_cart/', {
        method: 'POST',
        body: data,
        headers: {
            'X-CSRFToken': getCSRFToken()  // Add CSRF token to the request headers
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            // Show error message if out of stock
            alert(data.error);
        } else {
            // Update cart with the new item, but no alert
            cart.push({
                item_name: itemName,
                item_price: itemPrice,
                quantity: quantity,
                total: parseFloat(data.total_price),
            });
            displayCart();  // Display updated cart
        }
    })
    .catch(error => console.error('Error:', error));
}



function displayCart() {
    const cartTableBody = document.querySelector('#cart-table tbody');
    cartTableBody.innerHTML = '';  // Clear the table before re-rendering

    cart.forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.item_name}</td>
            <td>
                <input type="number" value="${item.quantity}" min="1" onchange="updateCartItemQuantity(${index}, this.value)">
            </td>
            <td>${item.item_price}</td>
            <td>${item.total}</td>
            <td><button onclick="removeFromCart(${index})">Remove</button></td>
        `;
        cartTableBody.appendChild(row);
    });
}

// Function to update quantity in the cart
function updateCartItemQuantity(cartItemIndex, newQuantity) {
    const item = cart[cartItemIndex];
    const itemId = item.item_id;  // Get item ID
    const data = new FormData();
    data.append("item_id", itemId);
    data.append("quantity", newQuantity);

    fetch('/update_cart_quantity/', {  // Assuming you create an endpoint for this
        method: 'POST',
        body: data,
        headers: {
            'X-CSRFToken': getCSRFToken()  // Add CSRF token to the request headers
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            // Show error if insufficient stock
            alert(data.error);
        } else {
            // Update the quantity and total in the cart
            cart[cartItemIndex].quantity = newQuantity;
            cart[cartItemIndex].total = newQuantity * parseFloat(data.item_price);
            displayCart();  // Update the cart display with new quantity and total
        }
    })
    .catch(error => console.error('Error:', error));
}


// Function to update the price of an item in the cart
function updateCartPrice(index, newPrice) {
    cart[index].item_price = newPrice;
    cart[index].total = cart[index].quantity * newPrice;
    displayCart();
}

// Function to remove item from the cart
function removeFromCart(cartItemIndex) {
    cart.splice(cartItemIndex, 1);  // Remove the item from the cart array
    displayCart();  // Re-render the cart
}

// Function to update the total amount of the cart
function updateTotal() {
    const totalAmount = cart.reduce((total, item) => total + item.total, 0);
    document.getElementById("total-amount").innerText = totalAmount.toFixed(2);  // Format to 2 decimal places
}


// Function to generate the bill
function generateBill() {
    fetch('/generate_bill/')
        .then(response => response.json())
        .then(data => {
            if (data.bill_items) {
                let billHTML = "<h3>Bill</h3><table><tr><th>Item</th><th>Quantity</th><th>Price</th><th>Total</th></tr>";
                data.bill_items.forEach(item => {
                    billHTML += `<tr><td>${item.name}</td><td>${item.quantity}</td><td>${item.price}</td><td>${item.total}</td></tr>`;
                });
                billHTML += `</table><h3>Total: $${data.total_amount}</h3>`;
                document.getElementById("bill-section").innerHTML = billHTML;
            } else {
                alert('Error generating bill');
            }
        });
}
