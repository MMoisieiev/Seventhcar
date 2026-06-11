function calculateBookingDays(startDateStr, startTimeStr, endDateStr, endTimeStr) {
  const startDate = new Date(`${startDateStr}T00:00:00`);
  const endDate = new Date(`${endDateStr}T00:00:00`);

  let days = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

  if (endTimeStr > startTimeStr) {
    days += 1;
  }

  return Math.max(1, days);
}

function getTierMultiplier(dayCount) {
  if (dayCount === 1) return 1.5;
  if (dayCount >= 2 && dayCount <= 3) return 1.25;
  if (dayCount >= 4 && dayCount <= 6) return 1.11;
  if (dayCount >= 7 && dayCount <= 10) return 1.0;
  if (dayCount >= 11 && dayCount <= 14) return 0.9;
  if (dayCount >= 15 && dayCount <= 21) return 0.8;
  return 0.7;
}
