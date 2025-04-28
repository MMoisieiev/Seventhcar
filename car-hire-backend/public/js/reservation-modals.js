// reservation-modals.js

document.addEventListener("DOMContentLoaded", function () {

    // -------------------------------------------------------------------
    // 1) Initialize All Modal-Related Event Listeners
    // -------------------------------------------------------------------
    function initializeModalEventListeners() {
      document.body.addEventListener("click", function (event) {
  
        // "Add New Reservation" button
        if (event.target.matches("#addReservationBtn")) {
          openEditReservationModal(null); // No ID => new reservation
        }
  
        // Approve / Reject
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
    
          fetch(`/api/reservations/${reservationId}/extras`)
            .then(res => res.json())
            .then(extras => {
              const dropdown = document.getElementById("extrasDropdown");
              dropdown.innerHTML = extras.map(extra => `
                <option>
                  ${extra.extra_id} | Days: ${extra.days} | €${extra.price_at_booking}
                </option>
              `).join('');
            });
    
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
      // 1) Load all available extras into the form
      fetch("/api/extras")
        .then(res => res.json())
        .then(allExtras => {
          const container = document.getElementById('extrasList');
          container.innerHTML = allExtras.map(extra => `
            <div class="form-check mb-2">
              <input type="checkbox"
                     class="form-check-input extra-checkbox"
                     value="${extra.id}"
                     id="extra-${extra.id}">
              <label class="form-check-label" for="extra-${extra.id}">
                ${extra.name} (€${extra.price}/day)
              </label>
              <div class="ml-4 d-inline-block">
                Days:
                <input type="number"
                       min="1"
                       value="1"
                       class="form-control form-control-sm d-inline-block"
                       style="width: 60px;"
                       id="extra-days-${extra.id}">
                <span data-price="${extra.price}"
                      id="extra-price-${extra.id}"
                      hidden></span>
              </div>
            </div>
          `).join('');
  
          // 2a) If creating new, reset core form
          if (!reservationId) {
            document.getElementById("editReservationForm").reset();
  
          // 2b) If editing, load existing reservation + its extras
          } else {
            fetch(`/api/reservations/${reservationId}`)
              .then(res => res.json())
              .then(reservation => {
                // Populate core fields
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
  
                // Pre-select this reservation’s extras
                fetch(`/api/reservations/${reservationId}/extras`)
                  .then(res => res.json())
                  .then(selectedExtras => {
                    selectedExtras.forEach(extra => {
                      const chk   = document.getElementById(`extra-${extra.extra_id}`);
                      const days  = document.getElementById(`extra-days-${extra.extra_id}`);
                      if (chk && days) {
                        chk.checked = true;
                        days.value  = extra.days;
                      }
                    });
                  });
              })
              .catch(err => console.error("Error loading reservation for edit:", err));
          }
  
          // 3) Wire up auto-calc on plate/date/extras inputs
          window.registerPriceAutoCalc();
          document.querySelectorAll('.extra-checkbox').forEach(chk =>
            chk.addEventListener('change', window.autoCalculatePrice)
          );
          document.querySelectorAll('[id^="extra-days-"]').forEach(input =>
            input.addEventListener('input', window.autoCalculatePrice)
          );
  
          // 4) Show the Edit modal
          $("#reservationModal").modal("hide");
          $("#editReservationModal").modal("show");
        })
        .catch(err => console.error("Error loading extras list:", err));
    }
  
    
  
    // -------------------------------------------------------------------
    // 4) Save (Create or Update) Reservation
    // -------------------------------------------------------------------
    function saveReservationChanges() {
      const reservationId = document.getElementById("editReservationId").value.trim();
    
      // Collect selected extras
      const extras = Array.from(document.querySelectorAll('.extra-checkbox:checked')).map(chk => ({
        extra_id: parseInt(chk.value, 10),
        days: parseInt(document.getElementById(`extra-days-${chk.value}`).value, 10),
        price_at_booking: parseFloat(document.getElementById(`extra-price-${chk.value}`).dataset.price)
      }));
    
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
        status: document.getElementById("editReservationStatus").value,
        extras // Include the extras array
      };
    
      const method = reservationId ? "PUT" : "POST";
      const url = reservationId ? `/api/reservations/${reservationId}` : "/api/reservations";
    
      fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedReservation)
      })
      .then(response => response.json())
      .then(() => {
        $("#editReservationModal").modal("hide");
        window.fetchReservations();
      })
      .catch(error => console.error("Error saving reservation:", error));
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

  // Expose globally
  window.openReservationModal    = openReservationModal;
  window.openEditReservationModal = openEditReservationModal;
});
  