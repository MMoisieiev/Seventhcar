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
  const reservationId = document.getElementById("editReservationId").value;

  if (!plateNumber || !startDateStr || !startTimeStr || !endDateStr || !endTimeStr) {
    return;
  }

  const startDT = new Date(`${startDateStr}T${startTimeStr}`);
  const endDT   = new Date(`${endDateStr}T${endTimeStr}`);
  if (endDT <= startDT) return;

  // skip conflict against itself
  if (await checkIfDatesConflict(plateNumber, startDT, endDT, reservationId)) {
    alert("These dates/times overlap an existing booking for this car.");
    return;
  }

  // fetch daily rate
  let dailyRate = 0;
  try {
    const res = await fetch(`/api/cars/${plateNumber}`);
    if (res.ok) dailyRate = (await res.json()).price || 0;
  } catch (e) {
    console.warn("Failed to fetch car rate:", e);
  }

  const diffHrs  = (endDT - startDT) / 36e5;
  const dayCount = Math.ceil(diffHrs / 24);

  // compute extras
  let extrasTotal = 0;
  document.querySelectorAll(".extra-checkbox:checked").forEach(chk => {
    const perDayCost = Number(
      document.getElementById(`extra-price-${chk.value}`).dataset.price
    );
    extrasTotal += perDayCost * dayCount;
  });

  priceField.value = (dayCount * dailyRate + extrasTotal).toFixed(2);
}


async function checkIfDatesConflict(plateNumber, startDT, endDT, selfId = null) {
  try {
    // fetch all reservations for this plate
    const res = await fetch(`/api/reservations?plate_number=${plateNumber}`);
    if (!res.ok) return false;
    const list = await res.json();
    return list.some(r => {
      if (String(r.id) === String(selfId)) return false;
      const rStart = new Date(`${r.start_date}T${r.start_time}`);
      const rEnd   = new Date(`${r.end_date}T${r.end_time}`);
      return startDT <= rEnd && rStart <= endDT;
    });
  } catch (e) {
    console.warn("Conflict check failed:", e);
    return false;
  }
}

// expose globally
window.registerPriceAutoCalc  = registerPriceAutoCalc;
window.autoCalculatePrice     = autoCalculatePrice;
