// bookingpage.js
document.addEventListener("DOMContentLoaded", function () {
  const carListContainer = document.getElementById("carList");
  const bookingTabs = document.querySelectorAll("#bookingTabs .nav-link");
  let currentStep = "vehicles";

  // --- Retrieve query params ---
  function getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    return {
      island: params.get("island"),
      dropOff: params.get("dropOff"),
      pickupDate: params.get("pickupDate"),
      pickupTime: params.get("pickupTime"),
      returnDate: params.get("returnDate"),
      returnTime: params.get("returnTime")
    };
  }
  const bookingData = getQueryParams();

  // --- Display a summary at the top ---
  document.getElementById("bookingSummary").innerHTML = `
    <strong>Island:</strong> ${bookingData.island} <br>
    <strong>Drop-Off Location:</strong> ${bookingData.dropOff} <br>
    <strong>Pickup:</strong> ${bookingData.pickupDate} at ${bookingData.pickupTime} <br>
    <strong>Return:</strong> ${bookingData.returnDate} at ${bookingData.returnTime} <br>
    <strong>Total Price:</strong> <span id="totalPriceDisplay">Calculating...</span> EUR
  `;

  // --- Switch booking steps/tabs ---
  function switchTab(tabName) {
    console.log(`switchTab called! currentStep=${currentStep} newTab=${tabName}`);
  
    // If you're currently on "insurance" and are switching to something else
    if (currentStep === "insurance" && tabName !== "insurance") {
      const insuranceContainer = document.getElementById("insuranceComparison");
      if (insuranceContainer) {
        insuranceContainer.innerHTML = "";
        console.log("Cleared insuranceComparison!");
      }
    }
  
    document.querySelector(`#bookingTabs .nav-link[href="#${tabName}"]`).click();
    currentStep = tabName;
  
    if (tabName === "insurance" && typeof window.loadInsuranceComparisonTable === "function") {
      window.loadInsuranceComparisonTable();
    }
  }
  

  // --- Calculate & display total price (car + insurance) ---
  async function autoCalculatePrice() {
    try {
      const plate = document.getElementById("editPlateNumber").value;
      const startDateStr = document.getElementById("editStartDate").value;
      const startTimeStr = document.getElementById("editStartTime").value;
      const endDateStr = document.getElementById("editEndDate").value;
      const endTimeStr = document.getElementById("editEndTime").value;

      if (!plate || !startDateStr || !endDateStr) {
        console.warn("autoCalculatePrice(): missing info to calculate.");
        return;
      }

      // 1) Fetch selected car info
      const res = await fetch(`/api/cars/${plate}`);
      if (!res.ok) throw new Error("Failed to fetch car data");
      const carData = await res.json();

      // 2) Calculate day difference
      const startDate = new Date(`${startDateStr}T${startTimeStr}`);
      const endDate = new Date(`${endDateStr}T${endTimeStr}`);
      const diffMs = endDate - startDate;
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      // 3) Car total
      const carTotal = diffDays * carData.price;

      // 4) Add insurance (if selected)
      let insurancePrice = 0;
      if (typeof window.getSelectedInsurance === "function") {
        const selectedIns = window.getSelectedInsurance(); // { id, price } or null
        if (selectedIns && selectedIns.price) {
          insurancePrice = parseFloat(selectedIns.price);
        }
      }

      // 5) Display grand total
      const grandTotal = carTotal + insurancePrice;
      document.getElementById("totalPriceDisplay").textContent = grandTotal.toFixed(2);
    } catch (error) {
      console.error("Error in autoCalculatePrice:", error);
      document.getElementById("totalPriceDisplay").textContent = "Error";
    }
  }

  // --- Fetch available cars & display them ---
  fetch(`/api/cars/available?startDate=${bookingData.pickupDate}&endDate=${bookingData.returnDate}`)
    .then(response => response.json())
    .then(cars => {
      carListContainer.innerHTML = "";

      if (cars.length === 0) {
        carListContainer.innerHTML = "<p>No available cars for the selected dates.</p>";
        return;
      }

      cars.forEach(car => {
        const carCard = document.createElement('div');
        carCard.classList.add('vehicle-item', 'car-presentation-box');
        carCard.innerHTML = `
          <div class="img-wrap">
            <div class="text-wrap">
              <span>${car.category || 'Intermediate'} - ${car.transmission || 'Automatic'}</span>
              <h3 class="title">${car.car_name}</h3>
              <p class="description">or similar...</p>
            </div>
            <div class="car-wrap">
              <div class="image-container">
                <img src="${car.car_image_url || '/assets/placeholder.jpg'}" alt="${car.car_name}" loading="lazy">
              </div>
            </div>
          </div>
          <div class="bottom-wrap content">
            <ul class="features">
              <li class="fuel">${car.fuel_type}</li>
              <li class="doors">${car.door_count} door(s)</li>
            </ul>
            <div class="price-wrap">
              <p class="price">${car.price || '0.00'} <span>EUR / day</span></p>
              <p class="total-price">Total: <span class="car-total-price" data-plate="${car.plate_number}">Calculating...</span> EUR</p>
            </div>
            <button class="btn-arrow button book-now" data-plate="${car.plate_number}">
              <span>Book now</span>
            </button>
          </div>
        `;
        carListContainer.appendChild(carCard);
      });

      // "Book now" -> store data + move to insurance step
      document.querySelectorAll(".book-now").forEach(button => {
        button.addEventListener("click", function () {
          const selectedPlate = this.getAttribute("data-plate");
          document.getElementById("editPlateNumber").value = selectedPlate;
          document.getElementById("editStartDate").value = bookingData.pickupDate;
          document.getElementById("editStartTime").value = bookingData.pickupTime;
          document.getElementById("editEndDate").value = bookingData.returnDate;
          document.getElementById("editEndTime").value = bookingData.returnTime;

          // Recalc once user chooses this car
          autoCalculatePrice();

          // Now show the Insurance tab
          switchTab("insurance");
        });
      });

      // Calculate total for each displayed car in the list
      document.querySelectorAll(".car-total-price").forEach(async priceElem => {
        const plate = priceElem.getAttribute("data-plate");
        try {
          const res = await fetch(`/api/cars/${plate}`);
          if (!res.ok) throw new Error("Failed to fetch car data");
          const carData = await res.json();

          const startDate = new Date(`${bookingData.pickupDate}T${bookingData.pickupTime}`);
          const endDate = new Date(`${bookingData.returnDate}T${bookingData.returnTime}`);
          const diffMs = endDate - startDate;
          const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
          const totalPrice = diffDays * carData.price;

          priceElem.textContent = totalPrice.toFixed(2);
        } catch (error) {
          console.error("Error calculating total price:", error);
          priceElem.textContent = "Error";
        }
      });
    })
    .catch(error => console.error("Error fetching available cars:", error));

  // --- Prevent skipping steps unless they've been reached ---
  bookingTabs.forEach(tab => {
    tab.addEventListener("click", function (event) {
      const targetTab = this.getAttribute("href").substring(1);
      if ((targetTab === "insurance" && currentStep !== "insurance") ||
          (targetTab === "addition" && currentStep !== "addition") ||
          (targetTab === "confirmation" && currentStep !== "confirmation")) {
        event.preventDefault();
      }
    });
  });

  // --- If there's a "Back to Vehicles" button in Insurance tab ---
  const backButton = document.querySelector("#insurance .btn-secondary");
  if (backButton) {
    backButton.addEventListener("click", function () {
      switchTab("vehicles");
    });
  }

  // Example: if some other script uses this function
  window.registerPriceAutoCalc = function() {
    // You can put additional logic here if needed
  };
});
