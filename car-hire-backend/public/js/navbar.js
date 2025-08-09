// navbar.js


(function setupNavbar() {

  // Define the HTML for admin links
  const adminLinks = `
  
    <li class="nav-item">
      <a class="nav-link font-weight-bold" href="cars" style="font-size: 1.1rem;">Vehicles</a>
    </li>
    <li class="nav-item">
      <a class="nav-link font-weight-bold" href="reservations" style="font-size: 1.1rem;">Reservations</a>
    </li>
    <li class="nav-item">
    <a class="nav-link font-weight-bold" href="calendar" style="font-size: 1.1rem;">Availability Calendar</a>
    </li>
    <li class="nav-item">
      <a class="nav-link font-weight-bold" id="extrasLink" href="extras" style="font-size: 1.1rem;">Extras</a>
    </li>
    <li class="nav-item">
      <a class="nav-link font-weight-bold" id="logoutLink" href="#" style="font-size: 1.1rem;">Logout</a>
    </li>
  `;

  // Define the HTML for public (not logged in) links
  const publicLinks = `
    <li class="nav-item active">
      <a class="nav-link font-weight-bold" href="/" style="font-size: 1.1rem;">Home</a>
    </li>
    <li class="nav-item">
      <a class="nav-link font-weight-bold" href="car-listing.html" style="font-size: 1.1rem;">Vehicles</a>
    </li>
    <li class="nav-item">
      <a class="nav-link font-weight-bold" href="#" style="font-size: 1.1rem;">Contact Us</a>
    </li>
    <li class="nav-item">
      <a class="nav-link font-weight-bold" href="#" style="font-size: 1.1rem;">Terms & Conditions</a>
    </li>
    <li class="nav-item">
      <a class="nav-link font-weight-bold" href="#" style="font-size: 1.1rem;">FAQ</a>
    </li>
    <li class="nav-item">
      <a class="nav-link font-weight-bold" href="#" style="font-size: 1.1rem;">About Us</a>
    </li>
    <li class="nav-item" id="login-item">
      <a class="nav-link font-weight-bold" href="/login" style="font-size: 1.1rem;">Login</a>
    </li>
  `;

  // Check if user is logged in
  const loggedIn = sessionStorage.getItem('loggedIn'); 
  console.log("Logged in value:", loggedIn);

  // Locate the navbar items container
  const navBarItems = document.getElementById('navbar-items');
  console.log("navBarItems is:", navBarItems);

  if (!navBarItems) {
    console.warn("No #navbar-items found in the DOM.");
    return;
  }

  // Inject the relevant links
  if (loggedIn) {
    navBarItems.innerHTML = adminLinks;

    // Attach logout handler
    const logoutLink = document.getElementById('logoutLink');
    logoutLink.addEventListener('click', function(e) {
      e.preventDefault();
      sessionStorage.removeItem('loggedIn');
      window.location.href = '';
    });
  } else {
    navBarItems.innerHTML = publicLinks;
  }
})(); // **🚀 This ensures the function executes immediately**
