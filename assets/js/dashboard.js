// dashboard.js

import { renderNav } from "./navbar.js";

document.addEventListener('DOMContentLoaded', () => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    if (!userInfo) {
        console.error("No user data found in local storage.");
        window.location.href = '/pages/login.html'; // redirect if not logged in
        return;
    }

    // Render nav
    renderNav(userInfo);
});