// /assets/js/statics/header.js
import { renderNav } from "./navbar.js";

document.addEventListener('DOMContentLoaded', () => {
    // Get user info from localStorage (or your backend)
    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");

    if (!userInfo) {
        console.error("No user data found in local storage.");
        window.location.href = '/pages/login.html'; // redirect if not logged in
        return;
    }

    // Render navbar
    renderNav(userInfo);

    const loadHeader = fetch('/pages/partials/header.html')
        .then(res => res.text())
        .then(html => {
            const temp = document.createElement('div');
            temp.innerHTML = html;
            document.body.insertBefore(temp, document.body.firstChild);
        });

    Promise.all([loadHeader]).then(() => {
        initHeaderFunctions();
    });

    function initHeaderFunctions() {
        // Live Date and Time
        setInterval(() => {
            const now = new Date();
            const options = {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            };
            document.getElementById('datetime').textContent = now.toLocaleString('en-US', options);
        }, 1000);

        // Avatar Dropdown
        const avataBtn = document.getElementById('avatarBtn');
        const dropdown = document.getElementById('avatarDropdown');

        avataBtn?.addEventListener("click", () => {
            dropdown.classList.toggle("show");
        });

        // Hide dropdown on outside click
        window.addEventListener("click", (e) => {
            if (!e.target.closest(".avatar-menu")) {
                dropdown?.classList.remove("show");
            }
        });
    }
});