// ------------------ CART STATE ------------------
// This object keeps track of all products in the cart.
// Key = productId (e.g. "product-0"), Value = quantity of that product

const cartState = {};

// ------------------ UPDATE CART TOTAL ------------------
// Adds up all product quantities in cartState and shows total in ".cart-quantity"
function updateCartTotal() {
  const total = Object.values(cartState).reduce((sum, qty) => sum + qty, 0);
  document.querySelector(".cart-quantity").innerHTML = `(${total})`;
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
      <span class="price">$${card.price.toFixed(2)}</apan>
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

      if (e.target.closest(".add")) {
        const addbtn = e.target.closest(".add");
        const btn = addbtn.closest(".addToCart");
        const card = btn.closest(".dessertCard");
        const countEl = btn.querySelector(".count");

        const cardId = card.dataset.productId;

        // Increase count in cartState
        cartState[cardId] = (cartState[cardId] || 0) + 1;
        updateCartTotal();

        // Increase displayed count
        let count = parseInt(countEl.textContent);
        count++;
        countEl.textContent = count;
      }

      if (e.target.closest(".minus")) {
        const minusbtn = e.target.closest(".minus");
        const btn = minusbtn.closest(".addToCart");

        const card = btn.closest(".dessertCard");
        const dessertImage = card.querySelector(".dessertImage img");

        const CountEl = btn.querySelector(".count");
        const cardId = card.dataset.productId;
        let count = parseInt(CountEl.textContent);

        //  If more than 1, just reduce count
        if (count > 1) {
          count--;
          CountEl.textContent = count;
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
          if (dessertImage) {
            dessertImage.style.border = "";
          }

          // Remove from cartState
          delete cartState[cardId];
          updateCartTotal();
        }
      }
    });
  });
});
