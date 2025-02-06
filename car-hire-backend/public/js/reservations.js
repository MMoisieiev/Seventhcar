document.addEventListener("DOMContentLoaded", function () {
    fetchReservations();

    // Fetch reservations from the API and display in the table
    function fetchReservations() {
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

                attachEventListeners();
            })
            .catch(error => console.error("Error fetching reservations:", error));
    }

    // Attach event listeners to dynamically added buttons
    function attachEventListeners() {
        document.querySelectorAll(".view-btn").forEach(button => {
            button.addEventListener("click", function () {
                const reservationId = this.getAttribute("data-id");
                openReservationModal(reservationId);
            });
        });

        document.querySelectorAll(".delete-btn").forEach(button => {
            button.addEventListener("click", function () {
                const reservationId = this.getAttribute("data-id");
                deleteReservation(reservationId);
            });
        });
    }

    // Open the reservation details modal
    function openReservationModal(reservationId) {
        fetch(`/api/reservations/${reservationId}`)
            .then(response => response.json())
            .then(reservation => {
                document.getElementById("modalCustomer").innerText = reservation.customer_name;
                document.getElementById("modalPlateNumber").innerText = reservation.plate_number;
                document.getElementById("modalStartDate").innerText = reservation.start_date;
                document.getElementById("modalEndDate").innerText = reservation.end_date;
                document.getElementById("modalPrice").innerText = reservation.total_price;
                document.getElementById("modalStatus").innerText = reservation.status;
    
                // ✅ Set correct reservation ID for Approve/Reject buttons
                document.getElementById("approveReservation").setAttribute("data-id", reservation.id);
                document.getElementById("rejectReservation").setAttribute("data-id", reservation.id);
    
                // ✅ Set correct reservation ID for the Edit button
                document.getElementById("editReservation").setAttribute("data-id", reservation.id);
    
                console.log("Approve/Reject/Edit buttons set for reservation ID:", reservation.id);
    
                $("#reservationModal").modal("show");
            })
            .catch(error => console.error("Error fetching reservation details:", error));
    }
    
    
    

    // Open the edit reservation modal
    document.getElementById("editReservation").addEventListener("click", function () {
        const reservationId = this.getAttribute("data-id");  // Get ID from button
    
        if (!reservationId) {
            console.error("Invalid reservation ID for editing.");
            return;
        }
    
        fetch(`/api/reservations/${reservationId}`)
            .then(response => {
                if (!response.ok) throw new Error("Reservation not found");
                return response.json();
            })
            .then(reservation => {
                console.log("Editing Reservation:", reservation); // Debugging log
    
                document.getElementById("editReservationId").value = reservation.id;
                document.getElementById("editCustomerName").value = reservation.customer_name;
                document.getElementById("editCustomerEmail").value = reservation.customer_email;
                document.getElementById("editCustomerPhone").value = reservation.customer_phone;
                document.getElementById("editPlateNumber").value = reservation.plate_number;
                document.getElementById("editStartDate").value = reservation.start_date;
                document.getElementById("editStartTime").value = reservation.start_time;
                document.getElementById("editEndDate").value = reservation.end_date;
                document.getElementById("editEndTime").value = reservation.end_time;
                document.getElementById("editTotalPrice").value = reservation.total_price;
                document.getElementById("editReservationStatus").value = reservation.status;
    
                $("#reservationModal").modal("hide");
                $("#editReservationModal").modal("show");
            })
            .catch(error => console.error("Error fetching reservation details:", error));
    });
    
    
    

    document.getElementById("saveReservationChanges").addEventListener("click", function () {
        const reservationId = document.getElementById("editReservationId").value;
    
        const updatedReservation = {
            customer_name: document.getElementById("editCustomerName").value,
            customer_email: document.getElementById("editCustomerEmail").value,
            customer_phone: document.getElementById("editCustomerPhone").value,
            plate_number: document.getElementById("editPlateNumber").value,
            start_date: document.getElementById("editStartDate").value,
            start_time: document.getElementById("editStartTime").value,
            end_date: document.getElementById("editEndDate").value,
            end_time: document.getElementById("editEndTime").value,
            total_price: document.getElementById("editTotalPrice").value,
            status: document.getElementById("editReservationStatus").value
        };
    
        fetch(`/api/reservations/${reservationId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedReservation)
        })
        .then(response => response.json())
        .then(() => {
            $("#editReservationModal").modal("hide");
            fetchReservations(); // Refresh the list
        })
        .catch(error => console.error("Error updating reservation:", error));
    });
    


    // Approve a reservation
    document.getElementById("approveReservation").addEventListener("click", function () {
        const reservationId = this.getAttribute("data-id");
        console.log("Approving reservation ID:", reservationId); // ✅ Log the ID
        updateReservationStatus(reservationId, "Approved");
    });
    
    document.getElementById("rejectReservation").addEventListener("click", function () {
        const reservationId = this.getAttribute("data-id");
        console.log("Rejecting reservation ID:", reservationId); // ✅ Log the ID
        updateReservationStatus(reservationId, "Cancelled");
    });
    
    // Update reservation status via API
    function updateReservationStatus(id, status) {
        fetch(`/api/reservations/${id}`)
            .then(response => response.json())
            .then(reservation => {
                // Keep all fields and only update status
                const updatedReservation = {
                    customer_name: reservation.customer_name,
                    customer_email: reservation.customer_email,
                    customer_phone: reservation.customer_phone,
                    plate_number: reservation.plate_number,
                    start_date: reservation.start_date,
                    start_time: reservation.start_time,
                    end_date: reservation.end_date,
                    end_time: reservation.end_time,
                    total_price: reservation.total_price,
                    status: status // ✅ Only changing status
                };
    
                fetch(`/api/reservations/${id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(updatedReservation)
                })
                .then(response => response.json())
                .then(() => {
                    $("#reservationModal").modal("hide");
                    fetchReservations(); // Refresh the list
                })
                .catch(error => console.error("Error updating reservation:", error));
            })
            .catch(error => console.error("Error fetching reservation data:", error));
    }
    
    

    // Delete reservation via API
    function deleteReservation(id) {
        if (confirm("Are you sure you want to delete this reservation?")) {
            fetch(`/api/reservations/${id}`, {
                method: "DELETE"
            })
            .then(response => response.json())
            .then(() => {
                fetchReservations(); // Refresh the list
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
                attachEventListeners();
            })
            .catch(error => console.error("Error filtering reservations:", error));
    });
});
