document.addEventListener('DOMContentLoaded', () => {
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