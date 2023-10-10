// cart.js

// Initialize an empty cart as an array
let cart = [];

// Function to add an item to the cart
function addToCart(productName, price) {
 cart.push({ productName, price });
}

// Function to display the cart
function displayCart() {
 // Get the cart element in the cart.html page
 const cartElement = document.getElementById('cart');

 // Clear the cart element
 cartElement.innerHTML = '';

 // Loop through the items in the cart and display them
 for (const item of cart) {
  const listItem = document.createElement('li');
  listItem.textContent = `${item.productName} - $${item.price}`;
  cartElement.appendChild(listItem);
 }
}