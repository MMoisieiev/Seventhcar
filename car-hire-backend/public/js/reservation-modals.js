// reservation-modals.js

document.addEventListener("DOMContentLoaded", function () {

    // -------------------------------------------------------------------
    // 1) Initialize All Modal-Related Event Listeners
    // -------------------------------------------------------------------
    function initializeModalEventListeners() {
      document.body.addEventListener("click", function (event) {
  
        // If you have an “Add New Reservation” button
        if (event.target.matches("#addReservationBtn")) {
          openEditReservationModal(null); // No ID => new reservation
        }
  
        // Approve or Reject
        if (event.target.matches("#approveReservation")) {
          const reservationId = event.target.getAttribute("data-id");
          updateReservationStatus(reservationId, "Approved");
        }
        if (event.target.matches("#rejectReservation")) {
          const reservationId = event.target.getAttribute("data-id");
          updateReservationStatus(reservationId, "Cancelled");
        }
  
        // Edit reservation from details modal
        if (event.target.matches("#editReservation")) {
          const reservationId = event.target.getAttribute("data-id");
          openEditReservationModal(reservationId);
        }
  
        // Save changes in Edit modal
        if (event.target.matches("#saveReservationChanges")) {
          saveReservationChanges();
        }
      });
    }
  
    // -------------------------------------------------------------------
    // 2) View Details Modal
    // -------------------------------------------------------------------
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
  
    // -------------------------------------------------------------------
    // 3) Open "Edit Reservation" Modal (reused for NEW and EDIT)
    // -------------------------------------------------------------------
    function openEditReservationModal(reservationId) {
      if (!reservationId) {
        // === NEW RESERVATION ===
        document.getElementById("editReservationId").value = "";
        document.getElementById("editCustomerName").value  = "";
        document.getElementById("editCustomerEmail").value = "";
        document.getElementById("editCustomerPhone").value = "";
        document.getElementById("editPlateNumber").value   = "";
        document.getElementById("editStartDate").value     = "";
        document.getElementById("editStartTime").value     = "";
        document.getElementById("editEndDate").value       = "";
        document.getElementById("editEndTime").value       = "";
        document.getElementById("editTotalPrice").value    = "";
        document.getElementById("editReservationStatus").value = "Pending";
  
        $("#reservationModal").modal("hide");
        $("#editReservationModal").modal("show");
  
        // Call registerPriceAutoCalc from /partials/pricecalc.js
        if (window.registerPriceAutoCalc) {
          window.registerPriceAutoCalc(); 
        }
  
      } else {
        // === EDIT EXISTING RESERVATION ===
        fetch(`/api/reservations/${reservationId}`)
          .then(response => response.json())
          .then(reservation => {
            document.getElementById("editReservationId").value     = reservation.id;
            document.getElementById("editCustomerName").value      = reservation.customer_name;
            document.getElementById("editCustomerEmail").value     = reservation.customer_email;
            document.getElementById("editCustomerPhone").value     = reservation.customer_phone;
            document.getElementById("editPlateNumber").value       = reservation.plate_number;
            document.getElementById("editStartDate").value         = reservation.start_date;
            document.getElementById("editStartTime").value         = reservation.start_time;
            document.getElementById("editEndDate").value           = reservation.end_date;
            document.getElementById("editEndTime").value           = reservation.end_time;
            document.getElementById("editTotalPrice").value        = reservation.total_price;
            document.getElementById("editReservationStatus").value = reservation.status;
  
            $("#reservationModal").modal("hide");
            $("#editReservationModal").modal("show");
  
            if (window.registerPriceAutoCalc) {
              window.registerPriceAutoCalc();
            }
          })
          .catch(error => console.error("Error fetching reservation details:", error));
      }
    }
  
    // -------------------------------------------------------------------
    // 4) Save (Create or Update) Reservation
    // -------------------------------------------------------------------
    function saveReservationChanges() {
      const reservationId = document.getElementById("editReservationId").value.trim();
  
      const updatedReservation = {
        customer_name:  document.getElementById("editCustomerName").value,
        customer_email: document.getElementById("editCustomerEmail").value,
        customer_phone: document.getElementById("editCustomerPhone").value,
        plate_number:   document.getElementById("editPlateNumber").value,
        start_date:     document.getElementById("editStartDate").value,
        start_time:     document.getElementById("editStartTime").value,
        end_date:       document.getElementById("editEndDate").value,
        end_time:       document.getElementById("editEndTime").value,
        total_price:    document.getElementById("editTotalPrice").value,
        status:         document.getElementById("editReservationStatus").value
      };
  
      if (!reservationId) {
        // CREATE (POST)
        fetch("/api/reservations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedReservation)
        })
        .then(response => response.json())
        .then(() => {
          $("#editReservationModal").modal("hide");
          window.fetchReservations(); // Refresh the list
        })
        .catch(error => console.error("Error creating reservation:", error));
  
      } else {
        // UPDATE (PUT)
        fetch(`/api/reservations/${reservationId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedReservation)
        })
        .then(response => response.json())
        .then(() => {
          $("#editReservationModal").modal("hide");
          window.fetchReservations();
        })
        .catch(error => console.error("Error updating reservation:", error));
      }
    }
  
    // -------------------------------------------------------------------
    // 5) Approve/Reject Reservation (Update Status)
    // -------------------------------------------------------------------
    function updateReservationStatus(id, newStatus) {
      fetch(`/api/reservations/${id}`)
        .then(response => response.json())
        .then(reservation => {
          const updatedReservation = {
            customer_name:  reservation.customer_name,
            customer_email: reservation.customer_email,
            customer_phone: reservation.customer_phone,
            plate_number:   reservation.plate_number,
            start_date:     reservation.start_date,
            start_time:     reservation.start_time,
            end_date:       reservation.end_date,
            end_time:       reservation.end_time,
            total_price:    reservation.total_price,
            status:         newStatus
          };
  
          fetch(`/api/reservations/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedReservation)
          })
          .then(response => response.json())
          .then(() => {
            $("#reservationModal").modal("hide");
            window.fetchReservations();
          })
          .catch(error => console.error("Error updating reservation:", error));
        })
        .catch(error => console.error("Error fetching reservation data:", error));
    }
  
    // -------------------------------------------------------------------
    // 6) Init
    // -------------------------------------------------------------------
    initializeModalEventListeners();
  
    // Expose if needed globally
    window.openReservationModal = openReservationModal;
    window.openEditReservationModal = openEditReservationModal;
  });
  