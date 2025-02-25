// pricecalc.js

// We'll track whether we've already shown the "extra day" alert for leftover hours
// so it doesn't pop up repeatedly for small time changes.
let leftoverAlertShown = false;

function registerPriceAutoCalc() {
  const plateElem     = document.getElementById("editPlateNumber");
  const startDateElem = document.getElementById("editStartDate");
  const startTimeElem = document.getElementById("editStartTime");
  const endDateElem   = document.getElementById("editEndDate");
  const endTimeElem   = document.getElementById("editEndTime");

  // Recalculate whenever these fields change
  if (plateElem)     plateElem.addEventListener("change", autoCalculatePrice);
  if (startDateElem) startDateElem.addEventListener("change", autoCalculatePrice);
  if (startTimeElem) startTimeElem.addEventListener("change", autoCalculatePrice);
  if (endDateElem)   endDateElem.addEventListener("change", autoCalculatePrice);
  if (endTimeElem)   endTimeElem.addEventListener("change", autoCalculatePrice);
}

async function autoCalculatePrice() {
  const plateNumber   = document.getElementById("editPlateNumber").value.trim();
  const startDateStr  = document.getElementById("editStartDate").value;
  const startTimeStr  = document.getElementById("editStartTime").value;
  const endDateStr    = document.getElementById("editEndDate").value;
  const endTimeStr    = document.getElementById("editEndTime").value;
  const priceField    = document.getElementById("editTotalPrice");

  // If any field is missing, skip
  if (!plateNumber || !startDateStr || !startTimeStr || !endDateStr || !endTimeStr) {
    return;
  }

  // Build full date/time strings, e.g. "2025-03-12T10:00"
  const startDateTimeStr = `${startDateStr}T${startTimeStr}`;
  const endDateTimeStr   = `${endDateStr}T${endTimeStr}`;

  const startDateTime = new Date(startDateTimeStr);
  const endDateTime   = new Date(endDateTimeStr);

  // 1) If end <= start => negative or zero time => skip leftover logic
  if (endDateTime <= startDateTime) {
    console.warn("End date/time is before or equal to start date/time. Skipping calc.");
    leftoverAlertShown = false; // reset for next time
    return;
  }

  // 2) Check for booking conflict
  try {
    const conflict = await checkIfDatesConflict(plateNumber, startDateTime, endDateTime);
    if (conflict) {
      alert("These dates/times are already booked for this car! Please choose another range.");
      // Clear fields to avoid confusion
      document.getElementById("editStartDate").value = "";
      document.getElementById("editStartTime").value = "";
      document.getElementById("editEndDate").value   = "";
      document.getElementById("editEndTime").value   = "";
      leftoverAlertShown = false; // reset
      return;
    }
  } catch (err) {
    console.error("Error checking date conflicts:", err);
    return;
  }

  // 3) Fetch the car’s daily rate
  let dailyRate = 0;
  try {
    const res = await fetch(`/api/cars/${plateNumber}`);
    if (!res.ok) {
      console.error("Failed to fetch car data for plate:", plateNumber);
      return;
    }
    const carData = await res.json();
    dailyRate = carData.price; // e.g. { plate_number: "...", price: 25 }
  } catch (err) {
    console.error("Error fetching car data:", err);
    return;
  }

  // 4) Calculate total hours
  const diffMs  = endDateTime - startDateTime; // ms
  const diffHrs = diffMs / (1000 * 60 * 60);   // hours

  // 5) Determine how many days to charge
  let dayCount = 0;

  if (diffHrs <= 24) {
    // Single day
    dayCount = 1;
    leftoverAlertShown = false; // reset if previously shown
  } else {
    // More than 24 hours => find leftover fraction
    const baseDays = Math.floor(diffHrs / 24);
    const leftover = diffHrs % 24;

    dayCount = baseDays;
    if (leftover > 0) {
      // Another partial day
      dayCount += 1;
      // Show the alert only once if not already shown
      if (!leftoverAlertShown) {
        leftoverAlertShown = true;
        alert("The last day exceeds 24 hours, so an additional day is being charged.");
      }
    } else {
      leftoverAlertShown = false;
    }
  }

  // 6) totalPrice = dayCount * dailyRate
  const totalPrice = dayCount * dailyRate;

  // 7) Update the price field
  priceField.value = totalPrice;
}

// Check for booking overlap
async function checkIfDatesConflict(plateNumber, startDT, endDT) {
  // If your /api/caravailability returns day-based ranges (e.g. {start, end}), 
  // this is an approximation for hour-level checks. 
  // For truly hour-based logic, you'd store times in DB as well.
  const response = await fetch(`/api/caravailability/${plateNumber}`);
  if (!response.ok) {
    throw new Error("Failed to fetch availability");
  }
  const bookedRanges = await response.json(); 
  // e.g. [ { start:"2025-03-14", end:"2025-03-16" }, ... ]

  const userStartMs = startDT.getTime();
  const userEndMs   = endDT.getTime();

  for (const range of bookedRanges) {
    const rangeStart = new Date(range.start).getTime();
    const rangeEnd   = new Date(range.end).getTime();
    // Overlap if userStart <= rangeEnd && rangeStart <= userEnd
    if (userStartMs <= rangeEnd && rangeStart <= userEndMs) {
      return true; // conflict
    }
  }
  return false;
}

// Expose the main registration function globally
window.registerPriceAutoCalc = registerPriceAutoCalc;
