async function loadData() {
  try {
    const dessertContainer = document.querySelector(".dessert-container");
    const response = await fetch("data.json");
    const data = await response.json();

    data.forEach((card) => {
      const dessertCard = document.createElement("article");
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
       <div class="dessertInfo">
       <span class="category">${card.category} </span>
      <h4 class="dessertName"> ${card.name}</h4> 
      <span class="price">$${card.price.toFixed(2)}</apan>
      </div>`;

      dessertContainer.appendChild(dessertCard);
    });
  } catch (error) {
    console.error("Error loading dessert data:", error);
    dessertContainer.innerHTML =
      '<p class="error">Failed to load menu. Please try again later.</p>';
  }
}

document.addEventListener("DOMContentLoaded", loadData);
// function createCart() {
//   const dessertContainer = document.querySelector(".dessert-container");
//   const body = document.body;
//   const cart = document.createElement("div");
//   cart.className = "cart";
//   body.insertAdjacentElement("beforeend", cart);
// }
// createCart();
