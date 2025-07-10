// pricecalc.js


let leftoverAlertShown = false;

function registerPriceAutoCalc() {
  // existing listeners
  ["editPlateNumber","editStartDate","editStartTime","editEndDate","editEndTime"]
    .map(id => document.getElementById(id))
    .filter(el => !!el)
    .forEach(el => el.addEventListener("change", autoCalculatePrice));

  // new: re-calc whenever extras are toggled …
  document.querySelectorAll(".extra-checkbox")
    .forEach(chk => chk.addEventListener("change", autoCalculatePrice));

  // … or their “days” inputs are edited
  document.querySelectorAll("[id^='extra-days-']")
    .forEach(input => input.addEventListener("input", autoCalculatePrice));

  // and do one initial calculation on modal open
  autoCalculatePrice();
}

async function autoCalculatePrice() {
  const priceField    = document.getElementById("editTotalPrice");
  const plateNumber   = document.getElementById("editPlateNumber").value.trim();
  const startDateStr  = document.getElementById("editStartDate").value;
  const startTimeStr  = document.getElementById("editStartTime").value;
  const endDateStr    = document.getElementById("editEndDate").value;
  const endTimeStr    = document.getElementById("editEndTime").value;

  const reservationIdEl = document.getElementById("editReservationId");
  const reservationId = reservationIdEl ? reservationIdEl.value : null;

  if (!plateNumber || !startDateStr || !startTimeStr || !endDateStr || !endTimeStr) {
    return;
  }

  const startDT = new Date(`${startDateStr}T${startTimeStr}`);
  const endDT   = new Date(`${endDateStr}T${endTimeStr}`);
  if (endDT <= startDT) return;

  if (await checkIfDatesConflict(plateNumber, startDT, endDT, reservationId)) {
    alert("These dates/times overlap an existing booking for this car.");
    return;
  }

  let dailyRate = 0;
  try {
    const res = await fetch(`/api/cars/${plateNumber}`);
    if (res.ok) dailyRate = (await res.json()).price || 0;
  } catch (e) {
    console.warn("Failed to fetch car rate:", e);
  }

  // Corrected inclusive day calculation:
  const dayCount = Math.ceil((endDT - startDT) / (1000 * 60 * 60 * 24)) + 1;

  // Multiplier logic (unchanged)
  let multiplier = 1;
  if (dayCount === 1) multiplier = 1.5;
  else if (dayCount > 1 && dayCount < 4) multiplier = 1.25;
  else if (dayCount >= 4 && dayCount < 7) multiplier = 1.11;
  else if (dayCount >= 7 && dayCount < 11) multiplier = 1.0;
  else if (dayCount >= 11 && dayCount < 15) multiplier = 0.9;
  else if (dayCount >= 15 && dayCount < 22) multiplier = 0.8;
  else if (dayCount >= 22) multiplier = 0.7;

  // Compute extras (unchanged)
  let extrasTotal = 0;
  document.querySelectorAll(".extra-checkbox:checked").forEach(chk => {
    const perDayCost = Number(
      document.getElementById(`extra-price-${chk.value}`).dataset.price
    );
    extrasTotal += perDayCost * dayCount;
  });

  // Final corrected price calculation
  const carPrice = dayCount * dailyRate * multiplier;
  priceField.value = (carPrice + extrasTotal).toFixed(2);
}



async function checkIfDatesConflict(plateNumber, startDT, endDT, selfId = null) {
  try {
    const res = await fetch(`/api/reservations?plate_number=${plateNumber}`);
    if (!res.ok) return false;
    const list = await res.json();

    return list.some(r => {
      if (selfId && r.id == selfId) return false;
      const rStart = new Date(`${r.start_date}T${r.start_time}`);
      const rEnd   = new Date(`${r.end_date}T${r.end_time}`);
      return startDT < rEnd && rStart < endDT;
    });
  } catch (e) {
    console.warn("Conflict check failed:", e);
    return false;
  }
}

// expose globally
window.registerPriceAutoCalc  = registerPriceAutoCalc;
window.autoCalculatePrice     = autoCalculatePrice;
