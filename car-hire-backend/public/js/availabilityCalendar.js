const calendarMonthYear = document.getElementById('calendarMonthYear');
const calendarGrid = document.getElementById('calendarGrid');
const prevBtn = document.getElementById('prevMonthBtn');
const nextBtn = document.getElementById('nextMonthBtn');

let today = new Date();
let shownMonth = new Date(today.getFullYear(), today.getMonth(), 1);

function pad(num) {
  return num.toString().padStart(2, '0');
}

function fetchAndRender() {
  const year = shownMonth.getFullYear();
  const month = shownMonth.getMonth();
  calendarMonthYear.textContent = shownMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

  fetch(`/api/reservations/availability?year=${year}&month=${month+1}`)
    .then(res => res.json())
    .then(arr => {
      const data = {};
      arr.forEach(item => data[item.date] = { freeCars: item.freeCars, availableCars: item.availableCars || [] });
      renderCalendar(year, month, data);
    })
    .catch(() => renderCalendar(year, month, {}));
}

function renderCalendar(year, month, data) {
  calendarGrid.innerHTML = '';
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month+1, 0);
  const startWeekDay = firstDay.getDay(); // 0=Sun
  const daysInMonth = lastDay.getDate();

  // Weekdays header
  ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].forEach(d => {
    const h = document.createElement('div');
    h.textContent = d;
    h.style.fontWeight = 'bold';
    h.style.background = '#f8f8f8';
    h.className = 'calendar-day disabled';
    calendarGrid.appendChild(h);
  });

  // Leading blanks
  for(let i=0;i<startWeekDay;i++) {
    const blank = document.createElement('div');
    blank.className = 'calendar-day disabled';
    calendarGrid.appendChild(blank);
  }

  // Actual days
  for (let day = 1; day <= daysInMonth; day++) {
  const d = new Date(year, month, day);
  const dateStr = `${year}-${pad(month+1)}-${pad(day)}`;
  const cell = document.createElement('div');
  cell.className = 'calendar-day';
  cell.innerHTML = `<div>${day}</div>`;

  // Get availability from API response
  const entry = data[dateStr] || { freeCars: 0, availableCars: [] };
  let { freeCars, availableCars = [] } = entry;

  // Color code (disable for past)
  if (d < new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
    cell.classList.add('disabled');
  } else if (freeCars === 0) {
    cell.classList.add('red');
  } else if (freeCars <= 4) {
    cell.classList.add('orange');
  } else {
    cell.classList.add('green');
  }

  // Free cars info as always-clickable link
  const freeInfo = document.createElement('span');
  freeInfo.className = 'free-cars';
  freeInfo.textContent = `${freeCars} free`;
  freeInfo.style.textDecoration = "underline";
  freeInfo.style.cursor = "pointer";
  freeInfo.onclick = (e) => {
    e.stopPropagation();
    if (availableCars && availableCars.length > 0) {
      alert("Available cars:\n" + availableCars.join("\n"));
    } else {
      alert("No detailed info about available cars for this day.");
    }
  };
  cell.appendChild(freeInfo);

  calendarGrid.appendChild(cell);
}
}

// Navigation
prevBtn.onclick = () => {
  shownMonth.setMonth(shownMonth.getMonth()-1);
  fetchAndRender();
};
nextBtn.onclick = () => {
  shownMonth.setMonth(shownMonth.getMonth()+1);
  fetchAndRender();
};

// Initial render
fetchAndRender();
