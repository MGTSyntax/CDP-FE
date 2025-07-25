// navbar.js

export function renderNav(userInfo, containerId = 'navMenu') {
    const navMenu = document.getElementById(containerId);
    if (!userInfo || !navMenu) return;

    const navConfig = {
        superadmin: ["dashboard", "profile", "viewables", "employees", "detachments"],
        hr: ["dashboard", "profile", "employees", "detachments"],
        payroll: ["dashboard", "profile", "employees", "detachments"],
        adlogistics: ["dashboard", "profile"],
        finance: ["dashboard", "profile", "detachments"],
        fieldpersonnel: ["dashboard", "profile"],
    };

    const linkMap = {
        dashboard: `<a href="/pages/dashboard.html"><i class="fa-solid fa-square-poll-horizontal"></i> Dashboard</a>`,
        profile: `
            <div class="dropdown">
                <span class="dropbtn"><i class="fa fa-user"></i> Employee Information <i class="fa fa-caret-down"></i></span>
                <div class="dropdown-content">
                    <a href="/pages/profile.html">Employee Profile</a>
                </div>
            </div>
            `,
        viewables: `
            <div class="dropdown">
                <button class="dropbtn"><i class="fa-solid fa-address-book"></i> Viewables <i class="fa fa-caret-down"></i></button>
                <div class="dropdown-content">
                    <a href="/pages/employees.html">Employees</a>
                    <a href="/pages/detachments.html">Detachments</a>
                </div>
            </div>
            `
    };

    const userLinks = navConfig[userInfo.userLevel] || [];
    let navHtml = userLinks.map(key => linkMap[key]).join('');
    navHtml += `<button id="logoutBtn"><i class="fa-solid fa-right-from-bracket"></i> Sign Out</button>`;

    navMenu.innerHTML = navHtml;

    // Logout Handler
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('userInfo');
            window.location.href = '/pages/login.html';
        });
    }

    // Inject Breadcrumb
    const currentPage = location.pathname.split('/').pop();

    const breadcrumbMap = {
        'profile.html': ['Employee Information', 'Employee Profile'],
        'employees.html': ['Viewables', 'Employees'],
        'detachments.html': ['Viewables', 'Detachments']
    };

    const crumbList = breadcrumbMap[currentPage];
    if (crumbList) {
        const breadcrumbContainer = document.createElement('nav');
        breadcrumbContainer.className = 'breadcrumb';
        breadcrumbContainer.innerHTML = `
            <div class="content-wrapper">
                <ul>
                    ${crumbList.map((label, idx) => {
                        if (idx === 0) {
                            return `<li><a href="/pages/dashboard.html"> ${label}</a></li>`;
                        } else {
                            return `<li>${label}</li>`;
                        }
                    }).join('')}
                </ul>
            </div>
        `;
        document.querySelector('.navmenu').insertAdjacentElement('afterend', breadcrumbContainer);
    }
}