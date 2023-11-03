<?php
session_start();

if (isset($_POST['action'])) {
    if ($_POST['action'] === 'add') {
        addToCart($_POST['item'], $_POST['price'], $_POST['quantity']);
    } elseif ($_POST['action'] === 'remove') {
        removeFromCart($_POST['item']);
    } elseif ($_POST['action'] === 'updateQuantity') {
        updateCartQuantity($_POST['item'], $_POST['quantity']);
    } elseif ($_POST['action'] === 'checkout') {
        checkout();
    }
}

function addToCart($item, $price, $quantity) {
    if (!isset($_SESSION['cart'])) {
        $_SESSION['cart'] = [];
    }

    // Add input validation here to check if $item, $price, and $quantity are valid
    if (isValidItem($item) && is_numeric($price) && $price >= 0 && is_numeric($quantity) && $quantity > 0) {
        if (isset($_SESSION['cart'][$item])) {
            $_SESSION['cart'][$item]['quantity'] += $quantity;
        } else {
            $_SESSION['cart'][$item] = [
                'name' => $item,
                'price' => $price,
                'quantity' => $quantity,
            ];
        }
    }
}

function removeFromCart($item) {
    if (isset($_SESSION['cart'][$item])) {
        unset($_SESSION['cart'][$item]);
    }
}

function updateCartQuantity($item, $quantity) {
    if (isset($_SESSION['cart'][$item]) && is_numeric($quantity) && $quantity >= 0) {
        $_SESSION['cart'][$item]['quantity'] = $quantity;
    }
}

function checkout() {
    // You can implement order processing logic here, such as sending an email or generating an invoice.
    // You may need to collect additional customer information and handle payment processing.
    
    // Clear the cart after checkout.
    unset($_SESSION['cart']);
}

function isValidItem($item) {
    // Implement your validation logic here, e.g., check if $item exists in a database or a predefined list of valid items.
    // Return true if valid, false if not.
    // Example: return in_array($item, $validItems);
}
