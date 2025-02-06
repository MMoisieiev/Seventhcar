document.addEventListener("DOMContentLoaded", function () {
    // Make fetchReservations globally accessible
    window.fetchReservations = function fetchReservations() {
        fetch("/api/reservations")
            .then(response => response.json())
            .then(reservations => {
                const tableBody = document.getElementById("reservationsTable");
                tableBody.innerHTML = ""; // Clear existing rows

                reservations.forEach(reservation => {
                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td>${reservation.id}</td>
                        <td>${reservation.customer_name}</td>
                        <td>${reservation.plate_number}</td>
                        <td>${reservation.start_date}</td>
                        <td>${reservation.end_date}</td>
                        <td>€${reservation.total_price}</td>
                        <td class="status-${reservation.status.toLowerCase()}">${reservation.status}</td>
                        <td>
                            <button class="btn btn-primary btn-sm view-btn" data-id="${reservation.id}">View</button>
                            <button class="btn btn-danger btn-sm delete-btn" data-id="${reservation.id}">Delete</button>
                        </td>
                    `;
                    tableBody.appendChild(row);
                });
            })
            .catch(error => console.error("Error fetching reservations:", error));
    };

    // Event Delegation: Attach event listeners dynamically to the body
    document.body.addEventListener("click", function (event) {
        if (event.target.matches(".view-btn")) {
            const reservationId = event.target.getAttribute("data-id");
            openReservationModal(reservationId); // Call function from reservation-modals.js
        }

        if (event.target.matches(".delete-btn")) {
            const reservationId = event.target.getAttribute("data-id");
            deleteReservation(reservationId);
        }
    });

    // Delete reservation via API
    function deleteReservation(id) {
        if (confirm("Are you sure you want to delete this reservation?")) {
            fetch(`/api/reservations/${id}`, {
                method: "DELETE"
            })
            .then(response => response.json())
            .then(() => {
                window.fetchReservations(); // Refresh the list
            })
            .catch(error => console.error("Error deleting reservation:", error));
        }
    }

    // Filter reservations
    document.getElementById("filterStatus").addEventListener("change", function () {
        const filter = this.value;
        fetch(`/api/reservations?status=${filter}`)
            .then(response => response.json())
            .then(reservations => {
                const tableBody = document.getElementById("reservationsTable");
                tableBody.innerHTML = "";

                reservations.forEach(reservation => {
                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td>${reservation.id}</td>
                        <td>${reservation.customer_name}</td>
                        <td>${reservation.plate_number}</td>
                        <td>${reservation.start_date}</td>
                        <td>${reservation.end_date}</td>
                        <td>€${reservation.total_price}</td>
                        <td class="status-${reservation.status.toLowerCase()}">${reservation.status}</td>
                        <td>
                            <button class="btn btn-primary btn-sm view-btn" data-id="${reservation.id}">View</button>
                            <button class="btn btn-danger btn-sm delete-btn" data-id="${reservation.id}">Delete</button>
                        </td>
                    `;
                    tableBody.appendChild(row);
                });
            })
            .catch(error => console.error("Error filtering reservations:", error));
    });

    // Call fetchReservations when the page loads
    window.fetchReservations();
});
