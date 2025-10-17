// /assets/js/statics/navbar.js
export async function renderNav(userInfo, containerId = 'navMenu') {
    const navMenu = document.getElementById(containerId);
    if (!userInfo || !userInfo.permissions || !navMenu) return;

    const visibleModules = userInfo.permissions
        .filter(p => p.viewing)
        .map(p => p.module);

    const linkMap = {
        dashboard: `<a href="/pages/dashboard.html"><i class="fa-solid fa-square-poll-horizontal"></i> Dashboard</a>`,
        profile: `<a href="/pages/profile.html"><i class="fa fa-user"></i> My Profile</a>`,
    };

    const hasDocuments = visibleModules.includes('documents');
    const hasAdminDocs = visibleModules.includes('adminDocs');
    const hasEmpList = visibleModules.includes('employeeList');
    const hasDetList = visibleModules.includes('detachmentList');

    let resourcesDropdown = '';
    let reportsDropdown = '';

    // === RESOURCES DROPDOWN ===
    if (hasDocuments || hasAdminDocs) {
        let resourceItems = '';
        if (hasDocuments)
            resourceItems += `<a href="/pages/documents.html"><i class="fa fa-folder"></i> Documents</a>`;
        if (hasAdminDocs)
            resourceItems += `<a href="/pages/admin-documents.html"><i class="fa fa-briefcase"></i> Admin Docs</a>`;

        resourcesDropdown = `
            <div class="dropdown">
                <button class="dropbtn">
                    <i class="fa-solid fa-address-book"></i> Resources
                    <i class="fa fa-caret-down"></i>
                </button>
                <div class="dropdown-content">
                    ${resourceItems}
                </div>
            </div>
        `;
    }

    // === REPORTS DROPDOWN ===
    if (hasEmpList || hasDetList) {
        let reportItems = '';
        if (hasEmpList)
            reportItems += `<a href="/pages/employees.html"><i class="fa fa-users"></i> Employees</a>`;
        if (hasDetList)
            reportItems += `<a href="/pages/detachments.html"><i class="fa fa-map-marker-alt"></i> Detachments</a>`;

        reportsDropdown = `
            <div class="dropdown">
                <button class="dropbtn">
                    <i class="fa-solid fa-clipboard-list"></i> Reports
                    <i class="fa fa-caret-down"></i>
                </button>
                <div class="dropdown-content">
                    ${reportItems}
                </div>
            </div>
        `;
    }

    // === MAIN NAV LINKS ===
    let navHtml = visibleModules
        .filter(m => !['documents', 'adminDocs', 'employeeList', 'detachmentList'].includes(m)) // exclude dropdowns
        .map(m => linkMap[m] || '')
        .join('');

    if (resourcesDropdown) navHtml += resourcesDropdown;
    if (reportsDropdown) navHtml += reportsDropdown;

    // ✅ Add working sign-out button in navbar
    navHtml += `<button id="logoutBtn" class="logout-btn">
                    <i class="fa-solid fa-right-from-bracket"></i> Sign Out
                </button>`;

    navMenu.innerHTML = navHtml;

    // === LOGOUT HANDLER ===
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            console.log('Logging out...');
            localStorage.removeItem('userInfo');
            window.location.href = '/pages/login.html';
        });
    } else {
        console.warn('Logout button not found in navbar.');
    }

    // === BREADCRUMB HANDLER ===
    const currentPage = location.pathname.split('/').pop();
    const breadcrumbMap = {
        'dashboard.html': ['Dashboard', ''],
        'profile.html': ['Employee Details', 'Employee Profile'],
        'employees.html': ['Reports', 'Employees'],
        'detachments.html': ['Reports', 'Detachments'],
        'documents.html': ['Resources', 'Documents'],
        'admin-documents.html': ['Resources', 'Admin Docs'],
    };

    const crumbList = breadcrumbMap[currentPage];
    if (crumbList) updateBreadcrumb(crumbList, containerId);
}

export function updateBreadcrumb(crumbs, containerId = 'navMenu') {
    document.querySelector('.breadcrumb')?.remove();

    const breadcrumbContainer = document.createElement('nav');
    breadcrumbContainer.className = 'breadcrumb';
    breadcrumbContainer.innerHTML = `
        <div class="content-wrapper">
            <ul>
                ${crumbs.map((label, idx) => {
                    if (!label) return "";
                    if (idx === 0) return `<li><a href="/pages/dashboard.html">${label}</a></li>`;
                    return `<li>${label}</li>`;
                }).join('')}
            </ul>
        </div>
    `;

    const navWrapper = document.querySelector('.navmenu');
    if (navWrapper) {
        navWrapper.insertAdjacentElement('afterend', breadcrumbContainer);
    } else {
        console.warn('⚠️ navmenu container not found for breadcrumb placement.');
    }
}
