// Create a new shopping cart object.
const shoppingCart = new ShoppingCart();

// Add an event listener to all "Add to Cart" buttons.
document.querySelectorAll('.menu-button').forEach(function(button) {
  button.addEventListener('click', function(event) {
    // Get the item name and price from the button attributes.
    const itemName = this.getAttribute('data-item-name');
    const itemPrice = this.getAttribute('data-item-price');

    // Create a new cart item object.
    const cartItem = {
      name: itemName,
      price: itemPrice,
      quantity: 1
    };

    // Add the cart item to the shopping cart.
    shoppingCart.addItem(cartItem);

    // Update the cart display.
    updateCartDisplay();
  });
});

// Remove items from the shopping cart.
function removeItemFromCart(itemName) {
  shoppingCart.removeItem(itemName);

  // Update the cart display.
  updateCartDisplay();
}

// Change the quantity of items in the cart.
function changeItemQuantityInCart(itemName, quantity) {
  shoppingCart.changeItemQuantity(itemName, quantity);

  // Update the cart display.
  updateCartDisplay();
}

// Checkout
function checkout() {
  // Get the total price of the shopping cart.
  const totalPrice = shoppingCart.getTotalPrice();

  // TODO: Implement checkout functionality using the total price.
}

// Update the cart display.
function updateCartDisplay() {
  // Get the number of items in the shopping cart.
  const numItemsInCart = shoppingCart.items.length;

  // Update the cart display element using the textContent property.
  document.getElementById('cart-display').textContent = 'Cart contains ' + numItemsInCart + ' items';
}
