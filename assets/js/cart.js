// Create an empty cart array
var cart = [];

// Add an event listener to all "Add to Cart" buttons
document.querySelectorAll('.menu-button').forEach(function(button) {
  button.addEventListener('click', function(event) {
    // Get the item name and price from the button attributes
    var itemName = this.getAttribute('data-item-name');
    var itemPrice = this.getAttribute('data-item-price');

    // Create a new cart item object
    var cartItem = {
      name: itemName,
      price: itemPrice,
      quantity: 1
    };

    // Add the cart item to the cart array
    cart.push(cartItem);

    // Update the cart display
    updateCartDisplay();

    // Add a "Remove from Cart" button to the cart item
    var removeButton = document.createElement('button');
    removeButton.innerHTML = 'Remove from Cart';
    removeButton.addEventListener('click', function() {
      removeItemFromCart(itemName);
    });
    cartItem.element.appendChild(removeButton);
  });
});

// Remove items from the cart
function removeItemFromCart(itemName) {
  // Find the cart item in the cart array
  var cartItem = cart.find(function(item) {
    return item.name === itemName;
  });

  // Remove the cart item from the cart array
  cart.splice(cart.indexOf(cartItem), 1);

  // Update the cart display
  updateCartDisplay();
}

// Change the quantity of items in the cart
function changeItemQuantityInCart(itemName, quantity) {
  // Find the cart item in the cart array
  var cartItem = cart.find(function(item) {
    return item.name === itemName;
  });

  // Update the cart item quantity
  cartItem.quantity = quantity;

  // Update the cart display
  updateCartDisplay();
}

// Checkout
function checkout() {
  // TODO: Implement checkout functionality
}

// Update the cart display
function updateCartDisplay() {
  // Get the number of items in the cart
  var numItemsInCart = cart.length;

  // Update the cart display element
  document.getElementById('cart-display').innerHTML = 'Cart contains ' + numItemsInCart + ' items';
}
