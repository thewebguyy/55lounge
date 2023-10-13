// cart.js
import { items } from './sharedData';

document.addEventListener("DOMContentLoaded", function () {
    // Function to render cart items
    function renderCartItems() {
        const cartItemsContainer = document.getElementById("cart-items");
        cartItemsContainer.innerHTML = "";

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const row = document.createElement("tr");
            row.innerHTML = `
                <td class="image" data-title="No">
                    <img src="${item.image}" alt="${item.name}">
                </td>
                <td class="product-des" data-title="Description">
                    <p class="product-name"><a href="#">${item.name}</a></p>
                    <p class="product-des">${item.description}</p>
                </td>
                <td class="price" data-title="Price"><span>#${item.price}</span></td>
                <td class="qty" data-title="Qty">
                    <div class="input-group">
                        <div class="button minus">
                            <button type="button" class="btn btn-primary btn-number" disabled="disabled" data-type="minus" data-field="quant[${i}]">
                                <i class="ti-minus"></i>
                            </button>
                        </div>
                        <input type="text" name="quant[${i}]" class="input-number" data-min="1" data-max="1000" value="${item.quantity || 0}">
                        <div class="button plus">
                            <button type="button" class="btn btn-primary btn-number" data-type="plus" data-field="quant[${i}]">
                                <i class="ti-plus"></i>
                            </button>
                        </div>
                    </div>
                </td>
                <td class="total-amount" data-title="Total"><span>#${(item.price * (item.quantity || 0))}</span></td>
                <td class="action" data-title="Remove">
                    <a href="#" class="remove-from-cart" data-index="${i}">
                        <i class="ti-trash remove-icon"></i>
                    </a>
                </td>
            `;

            cartItemsContainer.appendChild(row);
        }
    }

    // Call the renderCartItems function to populate the cart
    renderCartItems();
});
