// ------------------ CART STATE ------------------
// This object keeps track of all products in the cart.
// Key = productId (e.g. "product-0"), Value = quantity of that product

const cartState = {};

// ------------------ UPDATE CART TOTAL ------------------
// Adds up all product quantities in cartState and shows total in ".cart-quantity"
function updateCartTotal() {
	const cartContent = document.querySelector(".cartContent");

	const total = Object.values(cartState).reduce((sum, qty) => sum + qty, 0);
	document.querySelector(".cart-quantity").innerHTML = `(${total})`;
}

function renderCart() {
	cartContent.innerHTML = ""; // clear cart before re-rendering
	let productKeys = Object.keys(cartState).filter(
		(productId) => cartState[productId] > 0
	);
	if (productKeys.length === 0) {
		cartContent.innerHTML = `
      <div class="placeHolder">
        <div class="emptyimage"></div>
        <span class="added-items">Your added items will appear here</span>
      </div>`;
		return;
	}
	let total = 0;
	const itemContainer = document.createElement("div");
	itemContainer.className = "item-container";
	Object.keys(cartState).forEach((productId) => {
		const qty = cartState[productId];
		if (qty <= 0) return; // skip removed items

		// find the card info again
		const card = document.querySelector(`[data-product-id="${productId}"]`);
		const name = card.querySelector(".dessertName").textContent;
		const price = parseFloat(
			card.querySelector(".price").textContent.replace("$", "")
		);

		const lineTotal = price * qty;
		total += lineTotal;

		// Build the item element
		const item = document.createElement("div");
		item.className = "cart-item";
		item.innerHTML = `
      <div class="nameIcon">
        <div class="name">${name}</div>
        
      </div>
      <button class="remove" data-id="${productId}">
<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="none" viewBox="0 0 10 10"><path fill="currentColor" d="M8.375 9.375 5 6 1.625 9.375l-1-1L4 5 .625 1.625l1-1L5 4 8.375.625l1 1L6 5l3.375 3.375-1 1Z"/></svg>     
        </button>
      <div class="priceQnt">
        <div class="itemquantity">${qty}x</div>
        <div class="itemprice">@ $${price.toFixed(2)}</div>
        <div class="lineTotal">$${lineTotal.toFixed(2)}</div>
      </div>
    `;
		itemContainer.appendChild(item);
		cartContent.appendChild(itemContainer);

		document.querySelectorAll(".remove").forEach((button) => {
			button.addEventListener("click", (e) => {
				const productId = e.currentTarget.dataset.id;

				// Remove from cartState
				delete cartState[productId];

				// Reset the add to cart button if it exists
				const card = document.querySelector(`[data-product-id="${productId}"]`);
				if (card) {
					const btn = card.querySelector(".addToCart");
					if (btn) {
						btn.classList.remove("quantity-mode");
						btn.innerHTML = `
            <div class="cartIcon"><img src="assets/images/icon-add-to-cart.svg" alt=""></div>
            <span>Add to Cart</span>`;
						btn.style.backgroundColor = "";
						btn.style.color = "";
						btn.style.fontSize = "";
						btn.style.border = "";
						const dessertImage = card.querySelector(".dessertImage img");
						if (dessertImage) {
							dessertImage.style.border = "";
						}
					}
				}
				// Re-attach event listeners to allow the selection again
				updateCartTotal();
				renderCart();
			});
		});
	});

	// Add order total at the bottom
	const totalDiv = document.createElement("div");
	totalDiv.className = "orderTotal";
	totalDiv.innerHTML = `<div class="order">Order Total</div> <div class="total"><strong>$${total.toFixed(
		2
	)}</strong></div>`;
	cartContent.appendChild(totalDiv);
	const deliveryInfo = document.createElement("div");
	deliveryInfo.className = "carbonNeutral";
	deliveryInfo.innerHTML = `
<img src="assets/images/icon-carbon-neutral.svg" alt="">
          <span>This is a <strong>carbon-neutral</strong> delivery</span>
          `;
	cartContent.appendChild(deliveryInfo);
	const confirm = document.createElement("div");
	confirm.className = "confirmOrder";
	confirm.innerHTML = "Confirm Order";
	cartContent.appendChild(confirm);
}

// ------------------ LOAD DATA FROM JSON ------------------
async function loadData() {
	try {
		const dessertContainer = document.querySelector(".dessert-container");
		const response = await fetch("data.json");
		const data = await response.json();
		const cardContainer = document.createElement("div");
		cardContainer.className = " card-container";
		// Loop through each dessert item from data.json
		data.forEach((card, index) => {
			const dessertCard = document.createElement("article");

			// Give it a unique productId (used as key in cartState)
			dessertCard.dataset.productId = `product-${index}`;
			dessertCard.className = "dessertCard";

			dessertCard.innerHTML = `
       <picture class="dessertImage">
          <source media="(max-width: 600px)" srcset="${
						card.image.mobile
					}" data-size="mobile">
          <source media="(max-width: 900px)" srcset="${
						card.image.tablet
					}" data-size="tablet">
          <img src="${card.image.desktop}" alt="${card.name}" 
               loading="lazy" data-size="desktop" class="responsive-img">
        </picture>
		<button class="addToCart">
		<div class="cartIcon">
    <img src="assets/images/icon-add-to-cart.svg" alt="">
	</div>
		<span>Add to Cart</span>
		</button>
       <div class="dessertInfo">
       <span class="category">${card.category} </span>
      <h4 class="dessertName"> ${card.name}</h4> 
      <span class="price">$${card.price.toFixed(2)}</span>
      </div>`;
			cardContainer.appendChild(dessertCard);
			dessertContainer.appendChild(cardContainer);
		});
	} catch (error) {
		console.error("Error loading dessert data:", error);
		dessertContainer.innerHTML =
			'<p class="error">Failed to load menu. Please try again later.</p>';
	}
}

// ------------------ MAIN EVENT HANDLER ------------------
const cartContent = document.querySelector(".cartContent");
document.addEventListener("DOMContentLoaded", () => {
	loadData().then(() => {
		// Handle clicks anywhere on the page
		document.addEventListener("click", (e) => {
			if (e.target.closest(".addToCart")) {
				const btn = e.target.closest(".addToCart");
				if (!btn) return;
				const card = btn.closest(".dessertCard");
				if (!card) {
					return;
				}
				const dessertImage = card.querySelector(".dessertImage img");
				if (!dessertImage) {
					return;
				}
				const cardId = card.dataset.productId;

				// If it's still in normal "Add to Cart" mode
				if (!btn.classList.contains("quantity-mode")) {
					// Switch to quantity mode (with + and - buttons)
					btn.classList.add("quantity-mode");

					// Start this product with quantity = 1
					cartState[cardId] = 1;
					updateCartTotal();

					btn.innerHTML = `<div class="quantityBtn"><div class="minus"><svg xmlns="http://www.w3.org/2000/svg" width="10" height="2" fill="none" viewBox="0 0 10 2"><path fill="currentColor" d="M0 .375h10v1.25H0V.375Z"/></svg></div> <p class="count">1</p><div class="add"><svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="none" viewBox="0 0 10 10"><path fill="currentColor" d="M10 4.375H5.625V0h-1.25v4.375H0v1.25h4.375V10h1.25V5.625H10v-1.25Z"/></svg></div></div>`;
					console.log("clicked cart");
					btn.style.backgroundColor = "hsl(14, 86%, 42%)";
					btn.style.color = "white";
					btn.style.fontSize = "18px";
					btn.style.border = "1px solid hsl(14, 86%, 42%)";
					dessertImage.style.border = "2px solid hsl(14, 86%, 42%)";
				}
			}
			renderCart();

			if (e.target.closest(".add")) {
				const addbtn = e.target.closest(".add");
				const btn = addbtn.closest(".addToCart");
				const card = btn.closest(".dessertCard");
				const countEl = btn.querySelector(".count");

				const cardId = card.dataset.productId;

				// Increase count in cartState
				// If it is 0 make it 1 else increment it by 1
				cartState[cardId] = (cartState[cardId] || 0) + 1;
				updateCartTotal();

				// Increase displayed count
				let count = parseInt(countEl.textContent);
				count++;
				countEl.textContent = count;
				renderCart();
			}

			if (e.target.closest(".minus")) {
				const minusbtn = e.target.closest(".minus");
				const btn = minusbtn.closest(".addToCart");

				const card = btn.closest(".dessertCard");
				const dessertImage = card.querySelector(".dessertImage img");

				const countEl = btn.querySelector(".count");
				const cardId = card.dataset.productId;
				let count = parseInt(countEl.textContent);

				//  If more than 1, just reduce count
				if (count > 1) {
					count--;
					countEl.textContent = count;
					cartState[cardId] = count;
					updateCartTotal();
				}
				// If 1 → remove item completely
				else {
					// Back to noraml Add to Cart button
					btn.classList.remove("quantity-mode");
					btn.innerHTML = `
            <div class="cartIcon"><img src="assets/images/icon-add-to-cart.svg" alt=""></div>
            <span>Add to Cart</span>`;
					btn.style.backgroundColor = "";
					btn.style.color = "";
					btn.style.fontSize = "";
					btn.style.border = "";
					if (dessertImage) {
						dessertImage.style.border = "";
					}

					// Remove from cartState
					delete cartState[cardId];
					updateCartTotal();
				}
				renderCart();
			}
			function confirmOrder() {
				const confirm = document.querySelector(".confirmOrder");
				confirm.addEventListener("click", () => {
					const overlay = document.createElement("div");
					overlay.className = "overlay-wrapper";
					overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      flex-direction: column;
      align-items: center;
      
      z-index: 1000;
    `;

					const confirmation = document.createElement("div");
					confirmation.className = "confirmation";
					confirmation.style.backgroundColor = "white";
					const itemContainer = document.querySelector(".item-container");
					const clonedItems = itemContainer.cloneNode(true);
					const confirmTotal = document.querySelector(".orderTotal");

					confirmation.innerHTML = `
<div class="checkSvg"><img src="assets/images/icon-order-confirmed.svg" alt=""></div>
<h1 class="confirmationTitle">Order Confirmed</h1>
<p class="enjoy-text">We hope you enjoy your food !</p>
<div class="confirmation-content">

</div>
<div class="confirmation-total">${confirmTotal.innerHTML}</div>
<button class="newOrder">Start New Order</button>

      `;

      
					clonedItems.querySelectorAll(".cart-item").forEach((item) => {
						const name = item.querySelector(".name").textContent.trim();
						const qty = item.querySelector(".itemquantity").textContent.trim();
						const price = parseFloat(
							item
								.querySelector(".itemprice")
								.textContent.replace(/[^0-9.]/g, "")
						);
						const lineTotal = parseFloat(qty) * price;

  item.innerHTML = "";
            // create a NEW <img> for every product
						const thumb = document.createElement("img");
						thumb.className = "thumbnail";
						// choose correct thumbnail
						if (name.includes("Waffle")) {
							thumb.src = "assets/images/image-waffle-thumbnail.jpg";
						} else if (name.includes("Brownie")) {
							thumb.src = "assets/images/image-brownie-thumbnail.jpg";
						} else if (name.includes("Crème Brûlée")) {
							thumb.src = "assets/images/image-creme-brulee-thumbnail.jpg";
						} else if (name.includes("Macaron")) {
							thumb.src = "assets/images/image-macaron-thumbnail.jpg";
						} else if (name.includes("Tiramisu")) {
							thumb.src = "assets/images/image-tiramisu-thumbnail.jpg";
						} else if (name.includes("Baklava")) {
							thumb.src = "assets/images/image-baklava-thumbnail.jpg";
						} else if (name.includes("Pie")) {
							thumb.src = "assets/images/image-meringue-thumbnail.jpg";
						} else if (name.includes("Cake")) {
							thumb.src = "assets/images/image-cake-thumbnail.jpg";
						} else if (name.includes("Panna Cotta")) {
							thumb.src = "assets/images/image-panna-cotta-thumbnail.jpg";
						}
						item.innerHTML += `
      <div class="namePriceWrapper">
        <div class="name">${name}</div>
        <div class="lineTotal">$${lineTotal.toFixed(2)}</div>

      <div class="priceQnt">
        <div class="itemquantity">${qty}</div>
        <div class="itemprice">@ $${price.toFixed(2)}</div>
      </div>
      </div>

    `;
						// insert the thumbnail at the start of each cart-item
						item.prepend(thumb);
					});
					// now put the whole clonedItems list inside confirmation-content
					confirmation
						.querySelector(".confirmation-content")
						.appendChild(clonedItems);

					//

					overlay.appendChild(confirmation);
					document.body.appendChild(overlay);
				});
			}
			confirmOrder();
		});
	});
});
