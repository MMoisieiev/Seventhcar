document.addEventListener('DOMContentLoaded', function () {
    const carContainer = document.getElementById('carContainer');

    // Fetch cars from the database
    fetch('/api/cars')
        .then(response => response.json())
        .then(cars => {
            cars.forEach(car => {
                // Create the column wrapper
                const colDiv = document.createElement('div');
                colDiv.className = 'col-12 col-sm-6 col-md-4 col-lg-3 mb-4';

                // Create the car card
                const carCard = document.createElement('div');
                carCard.className = 'car-card';

                const carImage = car.car_image_url ? `/uploads/${car.car_image_url}` : '/assets/placeholder.jpg';

                carCard.innerHTML = `
                    <img src="${carImage}" alt="Car Image">
                    <div class="plate-number">Plate Number: ${car.plate_number}</div>
                    <div class="price">Price: €${car.price}</div>
                    <button class="btn btn-primary edit-btn" data-plate="${car.plate_number}">Edit</button>
                `;

                // Append the card to the column, then the column to the container
                colDiv.appendChild(carCard);
                carContainer.appendChild(colDiv);
            });

            // Add event listeners for edit buttons
            const editButtons = document.querySelectorAll('.edit-btn');
            editButtons.forEach(button => {
                button.addEventListener('click', function () {
                    const plateNumber = this.getAttribute('data-plate');

                    // Fetch full car details for the modal
                    fetch(`/api/cars/${plateNumber}`)
                        .then(response => response.json())
                        .then(car => {
                            if (car) {
                                openCarModal('edit', car); // Pass the car data to populate the modal
                            } else {
                                console.error('Car not found!');
                            }
                        })
                        .catch(error => console.error('Error fetching car details:', error));
                });
            });
        })
        .catch(error => console.error('Error fetching cars:', error));
});
