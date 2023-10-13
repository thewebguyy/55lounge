// menu.js
import { items } from './sharedData';

document.addEventListener("DOMContentLoaded", function () {
    // Add event listeners to "Add to Cart" buttons
    const addToCartButtons = document.querySelectorAll(".menu-button");
    addToCartButtons.forEach((button) => {
        button.addEventListener("click", function () {
            const itemName = button.getAttribute("data-item-name");
            const itemPrice = parseInt(button.getAttribute("data-item-price"), 10);
            addToCart(itemName, itemPrice);
        });
    });
});

function addToCart(name, price) {
    // Find the item in the shared items array and update its quantity
    const item = items.find((item) => item.name === name);
    if (item) {
        item.quantity = (item.quantity || 0) + 1;
    }
}
