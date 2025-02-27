document.addEventListener("DOMContentLoaded", function () {
    const carListContainer = document.getElementById("carList");
    
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
    
    // Display booking summary
    document.getElementById("bookingSummary").innerHTML = `
        <strong>Island:</strong> ${bookingData.island} <br>
        <strong>Drop-Off Location:</strong> ${bookingData.dropOff} <br>
        <strong>Pickup:</strong> ${bookingData.pickupDate} at ${bookingData.pickupTime} <br>
        <strong>Return:</strong> ${bookingData.returnDate} at ${bookingData.returnTime}
    `;

    // Fetch available cars based on selected dates
    fetch(`/api/cars/available?startDate=${bookingData.pickupDate}&endDate=${bookingData.returnDate}`)
        .then(response => response.json())
        .then(cars => {
            carListContainer.innerHTML = "";

            if (cars.length === 0) {
                carListContainer.innerHTML = "<p>No available cars for the selected dates.</p>";
                return;
            }

            cars.forEach(car => {
                const carList = document.createElement('div');
                carList.classList.add('car-list'); // Container for all car cards
                carList.innerHTML = cars.map(car => `
                  <div class="vehicle-item car-presentation-box">
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
                        <li class="fuel">${car.fuel_type }</li>
                        <li class="doors">${car.door_count } door(s)</li>
                      </ul>
                      <div class="price-wrap">
                        <p class="price">${car.price || '0.00'} <span>EUR / day</span></p>
                        <p class="total-price">Total: ${car.total_price || '0.00'} <span>EUR</span></p>
                      </div>
                      <a href="#" class="btn-arrow button buttonReservation" data-sipp="${car.sipp || ''}" data-currency="EUR" data-price="${car.total_price || '0.00'}" data-token="${car.token || ''}" data-pricelistid="${car.pricelistid || ''}" data-sip="${car.sip || ''}">
                        <span>Book now</span>
                      </a>
                    </div>
                  </div>
                `).join('');
                
                document.body.appendChild(carList); // Append the car list to the page
                carListContainer.appendChild(carCard);
            });

            document.querySelectorAll(".book-now").forEach(button => {
                button.addEventListener("click", function () {
                    const plateNumber = this.getAttribute("data-plate");
                    window.location.href = `/confirmation.html?plate=${plateNumber}&${window.location.search.substring(1)}`;
                });
            });
        })
        .catch(error => console.error("Error fetching available cars:", error));
});
