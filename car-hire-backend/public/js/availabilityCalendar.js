// availabilityCalendar.js
document.addEventListener("DOMContentLoaded", function () {
    // 1. Grab references to elements
    const toggleViewBtn        = document.getElementById("toggleViewBtn");
    const tableContainer       = document.getElementById("tableContainer");
    const availabilityContainer= document.getElementById("availabilityContainer");
    const calendarMonthYear    = document.getElementById("calendarMonthYear");
    const calendarGrid         = document.getElementById("calendarGrid");
    const prevMonthBtn         = document.getElementById("prevMonthBtn");
    const nextMonthBtn         = document.getElementById("nextMonthBtn");
  
    // 2. Track current view/month/year
    let showingCalendar = false;
    let currentMonth    = new Date().getMonth();     // 0-11
    let currentYear     = new Date().getFullYear();  // e.g., 2025
  
    // 3. Toggle the view when button is clicked
    toggleViewBtn.addEventListener("click", function () {
      showingCalendar = !showingCalendar;
      if (showingCalendar) {
        // Hide table, show calendar
        tableContainer.style.display        = "none";
        availabilityContainer.style.display = "block";
        toggleViewBtn.textContent = "Show Reservations Table";
  
        // Render the calendar for the current month
        renderCalendar(currentYear, currentMonth);
  
      } else {
        // Show table, hide calendar
        tableContainer.style.display        = "block";
        availabilityContainer.style.display = "none";
        toggleViewBtn.textContent = "Show Calendar Availability";
      }
    });
  
    // 4. Month navigation
    prevMonthBtn.addEventListener("click", function () {
      currentMonth--;
      if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
      }
      renderCalendar(currentYear, currentMonth);
    });
  
    nextMonthBtn.addEventListener("click", function () {
      currentMonth++;
      if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
      }
      renderCalendar(currentYear, currentMonth);
    });
  
    // 5. Render the Calendar
    async function renderCalendar(year, month) {
      // 5.1. Set month-year title
      const monthNames = [
        "January","February","March","April","May","June",
        "July","August","September","October","November","December"
      ];
      calendarMonthYear.textContent = `${monthNames[month]} ${year}`;
  
      // 5.2. Clear old cells
      calendarGrid.innerHTML = "";
  
      // 5.3. Determine how many days in the selected month
      const daysInMonth = new Date(year, month+1, 0).getDate(); // e.g. 30
      const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0=Sunday, etc.
  
      // 5.4. (Optionally) Fetch availability data from your server
      let availabilityData = [];
      try {
        availabilityData = await fetchAvailability(year, month+1); 
      } catch (error) {
        console.error("Error fetching availability:", error);
      }
  
      // Create a map so we can easily look up freeCars by date (YYYY-MM-DD)
      const freeCarsMap = {};
      availabilityData.forEach(item => {
        freeCarsMap[item.date] = item.freeCars;
      });
  
      // 5.5. Create blank cells for days before 'firstDayOfWeek' (for alignment)
      for (let i=0; i < firstDayOfWeek; i++){
        const blankCell = document.createElement("div");
        blankCell.classList.add("col-1", "p-2");
        calendarGrid.appendChild(blankCell);
      }
  
      // 5.6. Create a cell for each day of the month
      for (let day = 1; day <= daysInMonth; day++) {
        const dayCell = document.createElement("div");
        dayCell.classList.add("col-1", "border", "p-2", "text-center");
        dayCell.style.minWidth = "80px";
        dayCell.style.minHeight= "80px";
  
        // The actual date string e.g. "2025-02-05"
        const dateStr = formatDate(year, month+1, day);
  
        // Day number
        const dayNumber = document.createElement("div");
        dayNumber.textContent = day;
  
        // Free cars or default 0
        const freeCars = freeCarsMap[dateStr] || 0;
        const freeCarsDiv = document.createElement("div");
        freeCarsDiv.textContent = `${freeCars} free`;
  
        // Color code (simple example)
        if (freeCars === 0) {
          dayCell.style.backgroundColor = "red";
        } else if (freeCars <= 10) {
          dayCell.style.backgroundColor = "orange";
        } else {
          dayCell.style.backgroundColor = "green";
        }
  
        // Append day info
        dayCell.appendChild(dayNumber);
        dayCell.appendChild(freeCarsDiv);
  
        calendarGrid.appendChild(dayCell);
      }
    }
  
    // 6. Helper: format date as YYYY-MM-DD (assuming month is 1-based here)
    function formatDate(year, month, day) {
      const mm = String(month).padStart(2, '0');
      const dd = String(day).padStart(2, '0');
      return `${year}-${mm}-${dd}`;
    }
  
    // 7. Helper: fetchAvailability from server (replace with your actual API)
    async function fetchAvailability(year, month) {
      // Example endpoint: /api/availability?year=2025&month=2
      // For now, let's mock it:
  
      // let response = await fetch(`/api/availability?year=${year}&month=${month}`);
      // let data = await response.json();
      // return data;
  
      // Mock data example:
      const daysInMonth = new Date(year, month, 0).getDate();
      const results = [];
      for (let d=1; d<=daysInMonth; d++){
        const dateStr = formatDate(year, month, d);
        const freeCars = Math.floor(Math.random() * 20); 
        results.push({ date: dateStr, freeCars });
      }
      return results;
    }
  });
  