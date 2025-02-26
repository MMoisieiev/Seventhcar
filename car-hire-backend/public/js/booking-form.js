document.addEventListener("DOMContentLoaded", function () {
    const pickupDateInput = document.getElementById("pickupDate");
    const returnDateInput = document.getElementById("returnDate");

    // Ensure date pickers have the correct type
    pickupDateInput.setAttribute("type", "date");
    returnDateInput.setAttribute("type", "date");

    // Set placeholder and restore icon
    pickupDateInput.setAttribute("placeholder", "Select Date");
    returnDateInput.setAttribute("placeholder", "Select Date");

    // Disable past dates
    const today = new Date().toISOString().split("T")[0];
    pickupDateInput.setAttribute("min", today);
    returnDateInput.setAttribute("min", today);

    // Fetch unavailable dates from the database
    fetch(`/api/availability?year=${new Date().getFullYear()}&month=${new Date().getMonth() + 1}`)
        .then(response => response.json())
        .then(data => {
            const unavailableDates = data.filter(day => day.freeCars === 0).map(day => day.date);
            disableUnavailableDates(pickupDateInput, unavailableDates);
            disableUnavailableDates(returnDateInput, unavailableDates);
        })
        .catch(error => console.error("Error fetching availability:", error));

    function disableUnavailableDates(input, unavailableDates) {
        input.addEventListener("input", function () {
            if (unavailableDates.includes(input.value)) {
                alert("No available cars on this date. Please choose another date.");
                input.value = "";
            }
        });
    }

    // Populate time pickers with 30-minute intervals
    function populateTimeOptions(elementId) {
        const timeInput = document.getElementById(elementId);
        const timeList = document.createElement("datalist");
        timeList.id = `${elementId}-list`;

        for (let hour = 0; hour < 24; hour++) {
            for (let min of ["00", "30"]) {
                let timeString = `${hour.toString().padStart(2, "0")}:${min}`;
                let option = document.createElement("option");
                option.value = timeString;
                timeList.appendChild(option);
            }
        }

        timeInput.setAttribute("list", timeList.id);
        document.body.appendChild(timeList);
    }

    populateTimeOptions("pickupTime");
    populateTimeOptions("returnTime");
});
