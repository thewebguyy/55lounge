let subtotal = 0;

const calculateTotal = subtotal => {
  const total = parseFloat(subtotal);
  const formattedTotal = total.toFixed(2);
  return formattedTotal;
};

const getImgLink = title => {
  let imgLink;
  switch (title) {
    case 'English Breakfast':
      imgLink = 'assets/img/menu/breakfast.jpg';
      break;
    case 'American Breakfast':
      imgLink = 'assets/img/menu/breakfast.jpg';
      break;
    case 'Custard & Oats':
      imgLink = 'assets/img/menu/custard and oats.jpg';
      break;
    case 'Tea/Coffee':
      imgLink = 'assets/img/menu/coffee.jpg';
      break;
    case 'Afredo Pasta':
      imgLink = 'assets/img/menu/Alfredo.jpg';
      break;
    default:
      imgLink = 'assets/img/menu/coffee.jpg';
  }

  return imgLink;
};

$('.add-button').on('click', function () {
  const title = $(this).data('title');
  const price = $(this).data('price');
  const imgLink = getImgLink(title);

  const element = `
    <li class="cart-item">
      <img src="${imgLink}" alt="${title}">
      <div class="cart-item-dets">
        <p class="cart-item-heading">${title}</p>
        <p class="g-price">₦${price}</p>
      </div>
    </li>
  `;
  $('.cart-items').append(element);

  subtotal = subtotal + price;

  const formattedSubtotal = subtotal.toFixed(2);
  const total = calculateTotal(subtotal);

  $('.cart-math').html(`
    <p class="cart-math-item">
      <span class="cart-math-header">Subtotal:</span>
      <span class="g-price subtotal">₦${formattedSubtotal}</span>
    </p>
    <p class="cart-math-item">
      <span class="cart-math-header">Total:</span>
      <span class="g-price total">₦${total}</span>
    </p>
  `);
});
