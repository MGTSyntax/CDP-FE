// navbar.js

export function renderNav(userInfo, containerId = 'navMenu') {
    const navMenu = document.getElementById(containerId);
    if (!userInfo || !navMenu) return;

    const navConfig = {
        superadmin: ["dashboard", "profile", "employees", "detachments"],
        hr: ["dashboard", "profile", "employees", "detachments"],
        payroll: ["dashboard", "profile", "employees", "detachments"],
        adlogistics: ["dashboard", "profile"],
        finance: ["dashboard", "profile", "detachments"],
        fieldpersonnel: ["dashboard", "profile"],
    };

    const linkMap = {
        dashboard: `<a href="/pages/dashboard.html"><i class="fa-solid fa-square-poll-horizontal"></i> Dashboard</a>`,
        profile: `<a href="/pages/profile.html"><i class="fa fa-user"></i> Profile</a>`,
        employees: `<a href="/pages/employees.html">Employees</a>`,
        detachments: `<a href="/pages/detachments.html">Detachments</a>`
    };

    const userLinks = navConfig[userInfo.userLevel] || [];
    let navHtml = userLinks.map(key => linkMap[key]).join('');
    navHtml += `<button id="logoutBtn"><i class="fa-solid fa-right-from-bracket"></i> Sign Out</button>`;

    navMenu.innerHTML = navHtml;

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('userInfo');
            window.location.href = '/pages/login.html';
        });
    }
}