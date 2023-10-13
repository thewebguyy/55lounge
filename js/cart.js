document.addEventListener("DOMContentLoaded", function() {
    // Select all "Add to Cart" buttons
    const addToCartButtons = document.querySelectorAll(".menu-button");

    // Add a click event listener to each button
    addToCartButtons.forEach(button => {
        button.addEventListener("click", function() {
            const itemName = this.getAttribute("data-item-name");
            const itemPrice = parseFloat(this.getAttribute("data-item-price"));
            const itemQuantity = 1; // You can customize this based on your requirements

            // Create an object to represent the cart item
            const cartItem = { name: itemName, price: itemPrice, quantity: itemQuantity };

            // Check if the cart already exists in localStorage
            let cart = JSON.parse(localStorage.getItem("cart")) || [];

            // Check if the item is already in the cart
            const existingItemIndex = cart.findIndex(item => item.name === itemName);

            if (existingItemIndex !== -1) {
                // If the item is already in the cart, update the quantity
                cart[existingItemIndex].quantity += itemQuantity;
            } else {
                // If the item is not in the cart, add it
                cart.push(cartItem);
            }

            // Update the cart in localStorage
            localStorage.setItem("cart", JSON.stringify(cart));

            // Provide feedback to the user (you can customize this)
            alert(`${itemName} added to the cart!`);

            // You can optionally redirect to the cart page here if needed
            // window.location.href = "cart.html";
        });
    });
});
