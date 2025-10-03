// /assets/js/statics/navbar.js
export function renderNav(userInfo, containerId = 'navMenu') {
    const navMenu = document.getElementById(containerId);
    if (!userInfo || !navMenu) return;

    const navConfig = {
        superadmin: ["dashboard", "profile", "viewables", "employees", "detachments", "resources"],
        anlstaff: ["dashboard", "profile", "resources"],
        anlmanager: ["dashboard", "profile", "resources"],
        finstaff: ["dashboard", "profile", "viewables", "detachments"],
        finmanager: ["dashboard", "profile", "viewables", "employees", "detachments", "resources"],
        hrstaff: ["dashboard", "profile", "viewables", "employees", "detachments", "resources"],
        hrmanager: ["dashboard", "profile", "viewables", "employees", "detachments", "resources"],
        itsfaff: ["dashboard", "profile", "viewables", "detachments", "resources"],
        itmanager: ["dashboard", "profile", "viewables", "detachments", "resources"],
        legstaff: ["dashboard", "profile", "resources"],
        legmanager: ["dashboard", "profile", "resources"],
        opsstaff: ["dashboard", "profile", "resources"],
        opsmanager: ["dashboard", "profile", "resources"],
        fieldpersonnel: ["dashboard", "profile"],
    };

    const linkMap = {
        dashboard: `<a href="/pages/dashboard.html"><i class="fa-solid fa-square-poll-horizontal"></i> Dashboard</a>`,
        profile: `
            <div class="dropdown">
                <span class="dropbtn"><i class="fa fa-user"></i> Employee Details <i class="fa fa-caret-down"></i></span>
                <div class="dropdown-content">
                    <a href="/pages/profile.html"><i class="fa fa-user"></i> Employee Profile</a>
                </div>
            </div>
            `,
        viewables: `
            <div class="dropdown">
                <button class="dropbtn"><i class="fa-solid fa-address-book"></i> Viewable Lists <i class="fa fa-caret-down"></i></button>
                <div class="dropdown-content">
                    <a href="/pages/employees.html">Employee List</a>
                    <a href="/pages/detachments.html">Detachment List</a>
                </div>
            </div>
            `,
        resources: `<a href="/pages/documents.html"><i class="fa-solid fa-address-book"></i> Resources</a>`
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

    // Initial breadcrumb (based on page)
    const currentPage = location.pathname.split('/').pop();
    const breadcrumbMap = {
        'dashboard.html': ['Dashboard', ''],
        'profile.html': ['Employee Details', 'Employee Profile'],
        'employees.html': ['Viewables', 'Employees'],
        'detachments.html': ['Viewables', 'Detachments'],
        'documents.html': ['Resources', ''],
    };

    const crumbList = breadcrumbMap[currentPage];
    if (crumbList) {
        updateBreadcrumb(crumbList);
    }
}


/**
 * Dynamically update breadcrumb
 * @param {string[]} crumbs - array of breadcrumb labels
 */
export function updateBreadcrumb(crumbs) {
    // Remove existing breadcrumb
    document.querySelector('.breadcrumb')?.remove();

    const breadcrumbContainer = document.createElement('nav');
    breadcrumbContainer.className = 'breadcrumb';
    breadcrumbContainer.innerHTML = `
        <div class="content-wrapper">
            <ul>
                ${crumbs.map((label, idx) => {
                    if (!label) return "";
                    if (idx === 0) {
                        return `<li><a href="/pages/dashboard.html">${label}</a></li>`;
                    } else {
                        return `<li>${label}</li>`;
                    }
                }).join('')}
            </ul>
        </div>
    `;
    document.querySelector('.navmenu').insertAdjacentElement('afterend', breadcrumbContainer);
}