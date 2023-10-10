// Function to calculate the total amount in the cart
function calculateTotal() {
    let total = 0;
    for (const item of cart) {
      total += parseFloat(item.price);
    }
    return total;
  }
  
  // Function to update the total amount in the checkout page
  function updateTotal() {
    const totalAmountElement = document.querySelector('.total-amount');
    const cartSubtotalElement = document.querySelector('.cart-subtotal');
  
    const cartSubtotal = calculateTotal();
    const shippingFee = 1000; // Example shipping fee
  
    const cartTotal = cartSubtotal + shippingFee;
  
    cartSubtotalElement.textContent = `# ${cartSubtotal.toFixed(2)}`;
    totalAmountElement.textContent = `# ${cartTotal.toFixed(2)}`;
  }
  
  // Event listener for the "Checkout" button
  document.addEventListener('DOMContentLoaded', function () {
    const checkoutButton = document.querySelector('.checkout-button');
    
    if (checkoutButton) {
      checkoutButton.addEventListener('click', function (event) {
        event.preventDefault();
        // Perform checkout logic here, e.g., redirect to a payment page
        // You can also send the cart data to your server for processing
      });
    }
  });
  