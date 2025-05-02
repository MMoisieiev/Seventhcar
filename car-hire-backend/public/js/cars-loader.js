/**
 * Load cars from the server and render them inside a given container.
 * @param {HTMLElement} container - The DOM element where car cards should be appended.
 * @param {string} mode - Determines how the cars will be displayed ("admin", "public", etc.).
 */
function loadCars(container, mode) {
  // Clear container before loading new content
  container.innerHTML = '';

  // Fetch all cars
  fetch('/api/cars')
    .then(response => response.json())
    .then(cars => {
      cars.forEach(car => {
        // Render depending on mode
        if (mode === 'admin') {
          renderCarAdminMode(container, car);
        } else if (mode === 'public') {
          renderCarPublicMode(container, car);
        } else {
          // Fallback for other modes
          const defaultDiv = document.createElement('div');
          defaultDiv.textContent = `Car: ${car.car_name} (No specific mode)`;
          container.appendChild(defaultDiv);
        }
      });

      // In admin mode, wire up Edit + Calendar buttons
      if (mode === 'admin') {
        attachEditListeners(container);

        // Attach "View Calendar" button handlers
        container
          .querySelectorAll('.view-calendar-btn')
          .forEach(btn => {
            btn.addEventListener('click', () => {
              const plate = btn.getAttribute('data-plate-number');
              window.open(`partials/calendar.html?plateNumber=${plate}`, '_blank');
            });
          });
      }
    })
    .catch(error => console.error('Error fetching cars:', error));
}

/**
 * Render a single car in "admin" mode.
 * @param {HTMLElement} container - The parent container to append to.
 * @param {Object} car - The car data object.
 */
function renderCarAdminMode(container, car) {
  const colDiv = document.createElement('div');
  colDiv.className = 'col-12 col-sm-6 col-md-4 col-lg-3 mb-4';

  const carCard = document.createElement('div');
  carCard.className = 'car-card';

  const carImage = car.car_image_url
    ? `/uploads/${car.car_image_url}`
    : '/assets/placeholder.jpg';

  carCard.innerHTML = `
    <div class="car-name">${car.car_name || '—'}</div>
    <img src="${carImage}" alt="Car Image">
    <div class="plate-number">Plate Number: ${car.plate_number}</div>
    <div class="price">Price: €${car.price}</div>
    <button class="btn btn-primary edit-btn" data-plate="${car.plate_number}">
      Edit
    </button>
    <button
      class="btn btn-secondary view-calendar-btn"
      data-plate-number="${car.plate_number}"
    >
      View Calendar
    </button>
  `;

  colDiv.appendChild(carCard);
  container.appendChild(colDiv);
}

/**
 * Render a single car in "public" mode.
 * @param {HTMLElement} container - The parent container to append to.
 * @param {Object} car - The car data object.
 */
function renderCarPublicMode(container, car) {
  const colDiv = document.createElement('div');
  colDiv.className = 'col-12 col-sm-6 col-md-4 col-lg-3 mb-4';

  const carCard = document.createElement('div');
  carCard.className = 'public-car-card';

  const carImage = car.car_image_url
    ? `/uploads/${car.car_image_url}`
    : '/assets/placeholder.jpg';

  carCard.innerHTML = `
    <img src="${carImage}" alt="Car Image" style="width:100%;">
    <div class="car-name">Car Name: ${car.car_name}</div>
    <div class="fuel-type">Fuel: ${car.fuel_type}</div>
    <div class="price">Price: €${car.price}</div>
    <!-- No edit/calendar buttons in public mode -->
  `;

  colDiv.appendChild(carCard);
  container.appendChild(colDiv);
}

/**
 * Attach event listeners for edit buttons (only in admin mode).
 * @param {HTMLElement} container - The container in which .edit-btn elements were rendered.
 */
function attachEditListeners(container) {
  container.querySelectorAll('.edit-btn').forEach(button => {
    button.addEventListener('click', function () {
      const plateNumber = this.getAttribute('data-plate');
      // Fetch full car details for the modal
      fetch(`/api/cars/${plateNumber}`)
        .then(response => response.json())
        .then(car => {
          if (car) {
            openCarModal('edit', car);
          } else {
            console.error('Car not found!');
          }
        })
        .catch(error => console.error('Error fetching car details:', error));
    });
  });
}

// Expose the loadCars function globally so you can call it from any script
window.loadCars = loadCars;
