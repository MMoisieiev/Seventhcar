// reservation-modals.js

document.addEventListener("DOMContentLoaded", function () {

    // -------------------------------------------------------------------
    // 1) Initialize All Modal-Related Event Listeners
    // -------------------------------------------------------------------
    function initializeModalEventListeners() {
      // We'll watch for button clicks across the document body
      document.body.addEventListener("click", function (event) {
  
        // Open the details modal
        if (event.target.matches(".view-btn")) {
          const reservationId = event.target.getAttribute("data-id");
          openReservationModal(reservationId);
        }
  
        // Edit (existing) reservation
        if (event.target.matches("#editReservation")) {
          const reservationId = event.target.getAttribute("data-id");
          openEditReservationModal(reservationId); // existing reservation
        }
  
        // Approve / Reject from details modal
        if (event.target.matches("#approveReservation")) {
          const reservationId = event.target.getAttribute("data-id");
          updateReservationStatus(reservationId, "Approved");
        }
        if (event.target.matches("#rejectReservation")) {
          const reservationId = event.target.getAttribute("data-id");
          updateReservationStatus(reservationId, "Cancelled");
        }
  
        // Save changes in "Edit Reservation" modal
        if (event.target.matches("#saveReservationChanges")) {
          saveReservationChanges();
        }
  
        // If you have an "Add New Reservation" button somewhere:
        if (event.target.matches("#addReservationBtn")) {
          // null or "" => signals new reservation
          openEditReservationModal(null);
        }
      });
    }
  
    // -------------------------------------------------------------------
    // 2) View Details Modal
    // -------------------------------------------------------------------
    function openReservationModal(reservationId) {
      // Load data from /api/reservations/:id
      fetch(`/api/reservations/${reservationId}`)
        .then(response => response.json())
        .then(reservation => {
          // Fill in the details modal fields
          document.getElementById("modalCustomer").innerText     = reservation.customer_name;
          document.getElementById("modalPlateNumber").innerText  = reservation.plate_number;
          document.getElementById("modalStartDate").innerText    = reservation.start_date;
          document.getElementById("modalEndDate").innerText      = reservation.end_date;
          document.getElementById("modalPrice").innerText        = reservation.total_price;
          document.getElementById("modalStatus").innerText       = reservation.status;
  
          // Set data-id for Approve/Reject/Edit buttons
          document.getElementById("approveReservation").setAttribute("data-id", reservation.id);
          document.getElementById("rejectReservation").setAttribute("data-id", reservation.id);
          document.getElementById("editReservation").setAttribute("data-id", reservation.id);
  
          // Show the details modal
          $("#reservationModal").modal("show");
        })
        .catch(error => console.error("Error fetching reservation details:", error));
    }
  
    // -------------------------------------------------------------------
    // 3) Open "Edit Reservation" Modal
    //    - Reuse for both New (no ID) or Existing (with ID) Reservation
    // -------------------------------------------------------------------
    function openEditReservationModal(reservationId) {
      if (!reservationId) {
        // ================= NEW RESERVATION =================
        document.getElementById("editReservationId").value     = "";
        document.getElementById("editCustomerName").value      = "";
        document.getElementById("editCustomerEmail").value     = "";
        document.getElementById("editCustomerPhone").value     = "";
        document.getElementById("editPlateNumber").value       = "";
        document.getElementById("editStartDate").value         = "";
        document.getElementById("editStartTime").value         = "";
        document.getElementById("editEndDate").value           = "";
        document.getElementById("editEndTime").value           = "";
        document.getElementById("editTotalPrice").value        = "";
        document.getElementById("editReservationStatus").value = "Pending";
  
        // Hide the details modal (just in case) and show the edit modal
        $("#reservationModal").modal("hide");
        $("#editReservationModal").modal("show");
  
        // Attach auto-calc listeners so if user picks plate / dates, it updates price
        registerPriceAutoCalc();
  
      } else {
        // ================= EDIT EXISTING RESERVATION =================
        fetch(`/api/reservations/${reservationId}`)
          .then(response => response.json())
          .then(reservation => {
            // Fill the form fields
            document.getElementById("editReservationId").value  = reservation.id;
            document.getElementById("editCustomerName").value   = reservation.customer_name;
            document.getElementById("editCustomerEmail").value  = reservation.customer_email;
            document.getElementById("editCustomerPhone").value  = reservation.customer_phone;
            document.getElementById("editPlateNumber").value    = reservation.plate_number;
            document.getElementById("editStartDate").value      = reservation.start_date;
            document.getElementById("editStartTime").value      = reservation.start_time;
            document.getElementById("editEndDate").value        = reservation.end_date;
            document.getElementById("editEndTime").value        = reservation.end_time;
            document.getElementById("editTotalPrice").value     = reservation.total_price;
            document.getElementById("editReservationStatus").value = reservation.status;
  
            // Hide the details modal, show the edit modal
            $("#reservationModal").modal("hide");
            $("#editReservationModal").modal("show");
  
            // Attach auto-calc listeners for plate / date changes
            registerPriceAutoCalc();
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
        // ===== CREATE (POST) =====
        fetch("/api/reservations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedReservation)
        })
        .then(response => response.json())
        .then(() => {
          $("#editReservationModal").modal("hide");
          window.fetchReservations(); // Refresh the table
        })
        .catch(error => console.error("Error creating reservation:", error));
      } else {
        // ===== UPDATE (PUT) =====
        fetch(`/api/reservations/${reservationId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedReservation)
        })
        .then(response => response.json())
        .then(() => {
          $("#editReservationModal").modal("hide");
          window.fetchReservations(); // Refresh
        })
        .catch(error => console.error("Error updating reservation:", error));
      }
    }
  
    // -------------------------------------------------------------------
    // 5) Approve/Reject Reservation (Update Status)
    // -------------------------------------------------------------------
    function updateReservationStatus(id, newStatus) {
      // First fetch current reservation data, so we can keep other fields consistent
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
            window.fetchReservations(); // Refresh
          })
          .catch(error => console.error("Error updating reservation:", error));
        })
        .catch(error => console.error("Error fetching reservation data:", error));
    }
  
    // -------------------------------------------------------------------
    // 6) Auto-Calculate Price When Plate/Date Changes
    // -------------------------------------------------------------------
    function registerPriceAutoCalc() {
      const plateElem    = document.getElementById("editPlateNumber");
      const startDateElem= document.getElementById("editStartDate");
      const endDateElem  = document.getElementById("editEndDate");
  
      if (plateElem)    plateElem.addEventListener("change", autoCalculatePrice);
      if (startDateElem)startDateElem.addEventListener("change", autoCalculatePrice);
      if (endDateElem)  endDateElem.addEventListener("change", autoCalculatePrice);
    }
  
    async function autoCalculatePrice() {
      const plateNumber   = document.getElementById("editPlateNumber").value.trim();
      const startDateStr  = document.getElementById("editStartDate").value;
      const endDateStr    = document.getElementById("editEndDate").value;
      const priceField    = document.getElementById("editTotalPrice");
  
      if (!plateNumber || !startDateStr || !endDateStr) {
        return; // no calculation if missing data
      }
  
      // Convert strings to Date objects
      const startDate = new Date(startDateStr);
      const endDate   = new Date(endDateStr);
  
      // If invalid range
      if (endDate < startDate) {
        console.warn("End date is before start date, skipping price calc.");
        return;
      }
  
      // 1) Fetch car's daily rate
      let dailyRate = 0;
      try {
        const res = await fetch(`/api/cars/${plateNumber}`);
        if (!res.ok) {
          console.error("Failed to fetch car data for plate:", plateNumber);
          return;
        }
        const carData = await res.json(); 
        // Expecting something like: { plate_number: "...", price: 25, ... }
        dailyRate = carData.price;
      } catch (err) {
        console.error("Error fetching car data:", err);
        return;
      }
  
      // 2) Calculate # of days (inclusive)
      const msPerDay = 86400000;
      const diffMs   = endDate - startDate;
      const dayCount = Math.floor(diffMs / msPerDay) + 1; // inclusive
  
      // 3) totalPrice = dayCount * dailyRate
      const totalPrice = dayCount * dailyRate;
  
      // 4) Update the field
      priceField.value = totalPrice;
    }
  
    // -------------------------------------------------------------------
    // 7) Bootstrapping
    // -------------------------------------------------------------------
    // - Initialize event listeners
    // - Expose openReservationModal if needed globally
    // -------------------------------------------------------------------
    initializeModalEventListeners();
    window.openReservationModal = openReservationModal; 
    window.openEditReservationModal = openEditReservationModal; // optional
  });
  