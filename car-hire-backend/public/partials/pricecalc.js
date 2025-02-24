// pricecalc.js

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
  
    if (!plateNumber || !startDateStr || !startTimeStr || !endDateStr || !endTimeStr) {
      return; // Not enough info to calculate
    }
  
    // 1) Build full DateTime strings (assumes 'HH:MM' format for times)
    //    e.g. "2025-03-12T10:00:00"
    const startDateTimeStr = `${startDateStr}T${startTimeStr}:00`;
    const endDateTimeStr   = `${endDateStr}T${endTimeStr}:00`;
  
    const startDateTime = new Date(startDateTimeStr);
    const endDateTime   = new Date(endDateTimeStr);
  
    // 1.1 Validate time range
    if (endDateTime <= startDateTime) {
      console.warn("End date/time is before or equal to start date/time. Skipping calc.");
      return;
    }
  
    // 2) Check for booking conflicts
    try {
      const conflict = await checkIfDatesConflict(plateNumber, startDateTime, endDateTime);
      if (conflict) {
        alert("These dates/times are already booked for this car! Please choose another range.");
        return; 
      }
    } catch (err) {
      console.error("Error checking date conflicts:", err);
      return; 
    }
  
    // 3) Fetch car’s daily rate
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
    const diffMs  = endDateTime - startDateTime; // milliseconds
    const diffHrs = diffMs / (1000 * 60 * 60);   // hours
  
    // 5) Convert hours to day count
    const baseDays     = Math.floor(diffHrs / 24);
    const leftoverHrs  = diffHrs % 24;
  
    let dayCount = baseDays;
    if (leftoverHrs > 0) {
      // => Another partial day => charge 1 extra day
      dayCount += 1;
  
      // Show a warning or note that we’re charging an extra day
      alert(`The last day exceeds 24 hours. 
  We are charging for an additional day.`);
    }
  
    // 6) totalPrice = dayCount * dailyRate
    const totalPrice = dayCount * dailyRate;
  
    // 7) Update the field
    priceField.value = totalPrice;
  }
  
  /**
   * checkIfDatesConflict(plateNumber, startDT, endDT)
   *  -> returns true if there's any overlap with existing reservations
   *  -> startDT / endDT are JS Date objects
   */
  async function checkIfDatesConflict(plateNumber, startDT, endDT) {
    // 1) Fetch the caravailability for that plateNumber
    //    Suppose it returns an array of { start: "YYYY-MM-DD", end: "YYYY-MM-DD" }
    //    (day-based) or possibly day/time-based. We'll do day-based for now.
    const response = await fetch(`/api/caravailability/${plateNumber}`);
    if (!response.ok) {
      throw new Error("Failed to fetch availability");
    }
    const bookedRanges = await response.json(); 
    // e.g. [ { start: "2025-03-14", end: "2025-03-16" }, { ... } ]
  
    // 2) Convert user’s chosen startDT / endDT to numeric for easy comparison
    const userStartMs = +startDT;  // .getTime()
    const userEndMs   = +endDT;
  
    // 3) For each range, compute startMs..endMs. Check overlap
    for (const range of bookedRanges) {
      const rangeStart = new Date(range.start).getTime();
      const rangeEnd   = new Date(range.end).getTime();
      // Overlap if (userStart <= rangeEnd) && (rangeStart <= userEnd)
      if (userStartMs <= rangeEnd && rangeStart <= userEndMs) {
        return true; 
      }
    }
  
    return false; 
  }
  
  window.registerPriceAutoCalc = registerPriceAutoCalc;
  