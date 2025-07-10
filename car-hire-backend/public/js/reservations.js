// public/js/reservations.js

document.addEventListener("DOMContentLoaded", function () {
    // 1) Fetch and render reservations + extras dropdown
    window.fetchReservations = function fetchReservations() {
        fetch("/api/reservations")
            .then(response => response.json())
            .then(reservations => {
                const tableBody = document.getElementById("reservationsTable");
                tableBody.innerHTML = "";

                reservations.forEach(reservation => {
                    // Fetch extras for this reservation
                    fetch(`/api/reservations/${reservation.id}/extras`)
                        .then(res => res.json())
                        .then(extras => {
                            // Compute actual rental days
                            const startDate = new Date(reservation.start_date);
                            const endDate   = new Date(reservation.end_date);
                            const diffDays  = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

                            // Build dropdown options, multiplying per-day price by diffDays
                            const extrasOptions = extras.map(extra => {
                                const totalExtra = extra.price_at_booking * diffDays;
                                return `<option>
                                          ${extra.extra_id} | Days: ${diffDays} | €${totalExtra.toFixed(2)}
                                        </option>`;
                            }).join("");

                            const extrasDropdown = `
                                <select class="form-control form-control-sm">
                                  ${extrasOptions || "<option>No extras</option>"}
                                </select>`;

                            // Create table row
                            const row = document.createElement("tr");
                            row.innerHTML = `
                                <td>${reservation.id}</td>
                                <td>${reservation.customer_name}</td>
                                <td>${reservation.plate_number}</td>
                                <td>${reservation.start_date}</td>
                                <td>${reservation.start_time}</td>
                                <td>${reservation.end_date}</td>
                                <td>${reservation.end_time}</td>
                                <td>${extrasDropdown}</td>
                                <td>€${reservation.total_price}</td>
                                <td class="status-${reservation.status.toLowerCase()}">${reservation.status}</td>
                                <td>
                                  <button class="btn btn-primary btn-sm view-btn" data-id="${reservation.id}">View</button>
                                  <button class="btn btn-danger btn-sm delete-btn" data-id="${reservation.id}">Delete</button>
                                </td>`;
                            tableBody.appendChild(row);
                        })
                        .catch(err => console.error("Error fetching extras:", err));
                });
            })
            .catch(error => console.error("Error fetching reservations:", error));
    };

    // 2) Handle View and Delete button clicks via event delegation
    document.body.addEventListener("click", function (event) {
        if (event.target.matches(".view-btn")) {
            const reservationId = event.target.getAttribute("data-id");
            openReservationModal(reservationId);
        }
        if (event.target.matches(".delete-btn")) {
            const reservationId = event.target.getAttribute("data-id");
            deleteReservation(reservationId);
        }
    });

    // 3) Delete reservation
    function deleteReservation(id) {
        if (!confirm("Are you sure you want to delete this reservation?")) return;
        fetch(`/api/reservations/${id}`, { method: "DELETE" })
            .then(response => response.json())
            .then(() => window.fetchReservations())
            .catch(err => console.error("Error deleting reservation:", err));
    }

    // 4) Filter by status
    document.getElementById("filterStatus").addEventListener("change", function () {
        const status = this.value;
        const url = status ? `/api/reservations?status=${status}` : "/api/reservations";
        fetch(url)
            .then(res => res.json())
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
                        <td>${reservation.start_time}</td>
                        <td>${reservation.end_date}</td>
                        <td>${reservation.end_time}</td>
                        <td>€${reservation.total_price}</td>
                        <td class="status-${reservation.status.toLowerCase()}">${reservation.status}</td>
                        <td>
                          <button class="btn btn-primary btn-sm view-btn" data-id="${reservation.id}">View</button>
                          <button class="btn btn-danger btn-sm delete-btn" data-id="${reservation.id}">Delete</button>
                        </td>`;
                    tableBody.appendChild(row);
                });
            })
            .catch(err => console.error("Error filtering reservations:", err));
    });
    

    // 5) Initial load
    window.fetchReservations();
});
