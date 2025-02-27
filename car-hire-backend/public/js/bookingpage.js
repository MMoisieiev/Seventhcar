document.addEventListener("DOMContentLoaded", function () {
    // Function to get URL parameters
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

    // Get booking details
    const bookingData = getQueryParams();

    // Display the summary on the page
    document.getElementById("bookingSummary").innerHTML = `
        <strong>Island:</strong> ${bookingData.island} <br>
        <strong>Drop-Off Location:</strong> ${bookingData.dropOff} <br>
        <strong>Pickup:</strong> ${bookingData.pickupDate} at ${bookingData.pickupTime} <br>
        <strong>Return:</strong> ${bookingData.returnDate} at ${bookingData.returnTime}
    `;

    // Fetch available cars based on selected dates
    fetch(`/api/cars/available?pickupDate=${bookingData.pickupDate}&returnDate=${bookingData.returnDate}`)
        .then(response => response.json())
        .then(cars => {
            const carList = document.getElementById("carList");
            carList.innerHTML = "";

            if (cars.length === 0) {
                carList.innerHTML = "<p>No available cars for the selected dates.</p>";
            } else {
                cars.forEach(car => {
                    carList.innerHTML += `
                        <div class="car-card">
                            <h4>${car.car_name}</h4>
                            <p>Transmission: ${car.transmission}</p>
                            <p>Fuel: ${car.fuel_type}</p>
                            <p>Doors: ${car.door_count}</p>
                            <p>Storage: ${car.storage_space}</p>
                            <button class="book-now" data-plate="${car.plate_number}">Book Now</button>
                        </div>
                    `;
                });

                // Add event listeners to booking buttons
                document.querySelectorAll(".book-now").forEach(button => {
                    button.addEventListener("click", function () {
                        const plateNumber = this.getAttribute("data-plate");
                        window.location.href = `/confirmation.html?plate=${plateNumber}&${window.location.search.substring(1)}`;
                    });
                });
            }
        })
        .catch(error => console.error("Error fetching available cars:", error));
});
