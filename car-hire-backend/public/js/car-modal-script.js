function initializeModalScript() {
    const modal = document.getElementById('carModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const saveCarBtn = document.getElementById('saveCarBtn');
    const removeCarBtn = document.getElementById('removeCarBtn'); // New
    const addCarBtn = document.getElementById('addCarBtn');

    if (!modal) {
        console.error('Car modal element is missing in the DOM.');
        return;
    }

    // Open modal for "Add Car"
    if (addCarBtn) {
        addCarBtn.addEventListener('click', () => {
            openCarModal('add');
        });
    }

    // Close modal
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    window.addEventListener('click', (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    });

    function openCarModal(action, carData = {}) {
        const modalTitle = document.getElementById('modalTitle');
        const carForm = document.getElementById('carForm');

        // Store the action on the modal
        modal.dataset.action = action;

        if (action === 'edit') {
            modalTitle.textContent = 'Edit Car Details';
            saveCarBtn.textContent = 'Save Changes';

            // Show the Remove Car button in edit mode
            removeCarBtn.style.display = 'inline-block';

            // Populate form fields
            document.getElementById('carName').value = carData.car_name || '';
            document.getElementById('plateNumber').value = carData.plate_number || '';
            document.getElementById('transmission').value = carData.transmission || '';
            document.getElementById('fuelType').value = carData.fuel_type || '';
            document.getElementById('doorCount').value = carData.door_count || '';
            document.getElementById('storageSpace').value = carData.storage_space || '';
            document.getElementById('price').value = carData.price || '';
            document.getElementById('plateNumber').setAttribute('readonly', true);

        } else {
            modalTitle.textContent = 'Add New Car';
            saveCarBtn.textContent = 'Add Car';

            // Hide the Remove Car button in add mode
            removeCarBtn.style.display = 'none';

            // Clear form fields
            carForm.reset(); 
            document.getElementById('plateNumber').removeAttribute('readonly');
        }

        modal.style.display = 'block';
    }

    // Add event listener for saveCarBtn
    if (saveCarBtn) {
        saveCarBtn.addEventListener('click', () => {
            const action = modal.dataset.action;
            const formData = new FormData(document.getElementById('carForm'));

            let url;
            let method;

            if (action === 'add') {
                url = '/api/cars';
                method = 'POST';
            } else if (action === 'edit') {
                const plateNumber = document.getElementById('plateNumber').value;
                url = `/api/cars/${plateNumber}`;
                method = 'PUT';
            }

            fetch(url, {
                method: method,
                body: formData
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to save car data.');
                }
                return response.json();
            })
            .then(data => {
                console.log('Car saved successfully:', data);
                // Close modal
                modal.style.display = 'none';
                // Refresh the car list
                const carContainer = document.getElementById('carContainer');
                loadCars(carContainer, 'admin');
            })
            .catch(error => console.error('Error saving car:', error));
        });
    }

    // NEW: Add event listener for removeCarBtn
    if (removeCarBtn) {
        removeCarBtn.addEventListener('click', () => {
            // Confirm the action
            const confirmed = confirm('Are you sure you want to remove this car?');
            if (!confirmed) return;

            const plateNumber = document.getElementById('plateNumber').value;

            fetch(`/api/cars/${plateNumber}`, {
                method: 'DELETE'
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to remove car.');
                }
                return response.json();
            })
            .then(data => {
                console.log('Car removed successfully:', data);
                // Close modal
                modal.style.display = 'none';
                // Refresh the car list
                const carContainer = document.getElementById('carContainer');
                loadCars(carContainer, 'admin');
            })
            .catch(error => console.error('Error removing car:', error));
        });
    }

    // Expose openCarModal globally
    window.openCarModal = openCarModal;
}
