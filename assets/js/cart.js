document.addEventListener("DOMContentLoaded", function () {
  const cartItems = [];

  const addToCartButtons = document.querySelectorAll(".menu-button");
  const cartTableBody = document.getElementById("cart-items");
  const cartSubtotal = document.querySelector(".subtotal-amount");
  const cartTotal = document.querySelector(".total-amount");
  const checkoutLink = document.querySelector("#checkout-link");
  const clearCartButton = document.querySelector("#clear-cart-button");
  const emptyCartMessage = document.getElementById("empty-cart-message");

  function updateCheckoutLink() {
      const totalAmountNaira = cartItems.reduce((total, item) => total + item.total, 0).toFixed(2);
      checkoutLink.href = `https://wa.me/+2349040414233/?text=I%20would%20like%20to%20order:%20Total:%20₦${totalAmountNaira}`;
  }

  function updateEmptyCartMessage() {
      emptyCartMessage.style.display = cartItems.length === 0 ? "block" : "none";
  }

  function updateCartTable() {
      cartTableBody.innerHTML = "";
      let subtotal = 0;

      cartItems.forEach((item) => {
          const row = document.createElement("tr");
          row.innerHTML = `
              <td>${item.name}</td>
              <td>₦${item.price.toFixed(2)}</td>
              <td class="text-center">
                  <button class="quantity-adjust" data-item-name="${item.name}" data-increase="true">+</button>
                  ${item.quantity}
                  <button class="quantity-adjust" data-item-name="${item.name}" data-increase="false">-</button>
              </td>
              <td class="text-center">₦${item.total.toFixed(2)}</td>
              <td class="text-center"><i class="ti-trash remove-icon" data-item-name="${item.name}"></i></td>
          `;
          cartTableBody.appendChild(row);

          subtotal += item.total;
      });

      cartSubtotal.textContent = `₦${subtotal.toFixed(2)}`;
      cartTotal.textContent = `₦${subtotal.toFixed(2)}`;
  }

  addToCartButtons.forEach((button) => {
      button.addEventListener("click", function () {
          const itemName = button.getAttribute("data-item-name");
          const itemPrice = parseFloat(button.getAttribute("data-item-price"));
          const itemQuantity = 1; // Default quantity is 1

          // Check if the item is already in the cart
          const existingItem = cartItems.find(item => item.name === itemName);

          if (existingItem) {
              existingItem.quantity += 1;
              existingItem.total = existingItem.quantity * itemPrice;
          } else {
              // Add the new item to the cart
              cartItems.push({
                  name: itemName,
                  price: itemPrice,
                  quantity: itemQuantity,
                  total: itemPrice * itemQuantity,
              });
          }

          // Update the cart table
          updateCartTable();

          // Update the checkout link
          updateCheckoutLink();

          // Update the empty cart message
          updateEmptyCartMessage();
      });
  });

  cartTableBody.addEventListener("click", (event) => {
      if (event.target.classList.contains("ti-trash")) {
          const itemName = event.target.getAttribute("data-item-name");
          const itemIndex = cartItems.findIndex(item => item.name === itemName);
          if (itemIndex !== -1) {
              cartItems.splice(itemIndex, 1);
              updateCartTable();
              updateCheckoutLink();
              updateEmptyCartMessage();
          }
      } else if (event.target.classList.contains("quantity-adjust")) {
          const itemName = event.target.getAttribute("data-item-name");
          const increase = event.target.getAttribute("data-increase") === "true";
          const item = cartItems.find(item => item.name === itemName);
          if (item) {
              if (increase) {
                  item.quantity += 1;
              } else {
                  if (item.quantity > 1) {
                      item.quantity -= 1;
                  }
              }
              item.total = item.price * item.quantity;
              updateCartTable();
              updateCheckoutLink();
          }
      }
  });

  clearCartButton.addEventListener("click", () => {
      cartItems.length = 0; // Clear the cart
      updateCartTable();
      updateCheckoutLink();
      updateEmptyCartMessage();
  });

  updateEmptyCartMessage();
});
