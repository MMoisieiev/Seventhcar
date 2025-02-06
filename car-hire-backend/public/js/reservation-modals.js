document.addEventListener("DOMContentLoaded", function () {
    function initializeModalEventListeners() {
        document.body.addEventListener("click", function (event) {
            if (event.target.matches("#editReservation")) {
                const reservationId = event.target.getAttribute("data-id");
                openEditReservationModal(reservationId);
            }

            if (event.target.matches("#approveReservation")) {
                const reservationId = event.target.getAttribute("data-id");
                updateReservationStatus(reservationId, "Approved");
            }

            if (event.target.matches("#rejectReservation")) {
                const reservationId = event.target.getAttribute("data-id");
                updateReservationStatus(reservationId, "Cancelled");
            }

            if (event.target.matches("#saveReservationChanges")) {
                saveReservationChanges();
            }
        });
    }

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

                document.getElementById("approveReservation").setAttribute("data-id", reservation.id);
                document.getElementById("rejectReservation").setAttribute("data-id", reservation.id);
                document.getElementById("editReservation").setAttribute("data-id", reservation.id);

                $("#reservationModal").modal("show");
            })
            .catch(error => console.error("Error fetching reservation details:", error));
    }

    function openEditReservationModal(reservationId) {
        fetch(`/api/reservations/${reservationId}`)
            .then(response => response.json())
            .then(reservation => {
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
    }

    function saveReservationChanges() {
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
            window.fetchReservations(); // Refresh the list
        })
        .catch(error => console.error("Error updating reservation:", error));
    }

    function updateReservationStatus(id, status) {
        fetch(`/api/reservations/${id}`)
            .then(response => response.json())
            .then(reservation => {
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
                    status: status // ✅ Send all fields, only updating the status
                };
    
                fetch(`/api/reservations/${id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(updatedReservation) // ✅ Fix: Send full data
                })
                .then(response => response.json())
                .then(() => {
                    $("#reservationModal").modal("hide");
                    window.fetchReservations(); // Refresh the list
                })
                .catch(error => console.error("Error updating reservation:", error));
            })
            .catch(error => console.error("Error fetching reservation data:", error));
    }
    

    // Ensure event listeners are set up correctly
    initializeModalEventListeners();

    // Make modal functions globally accessible
    window.openReservationModal = openReservationModal;
});
