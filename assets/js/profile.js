// profile.js - Loads user info and shows in the navbar
import { getEmpProfile } from "./api.js";

document.addEventListener('DOMContentLoaded', () => {
    const welcomeMessage = document.querySelector('#welcomeMessage');
    const navMenu = document.getElementById('navMenu');
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    if (!userInfo) {
        console.error("No user data found in local storage.");
        window.location.href = '/pages/login.html'; // redirect if not logged in
        return;
    }

    // Set welcome message
    if (welcomeMessage) {
        welcomeMessage.textContent = `Hi ${userInfo.firstName}!`;
    }

    // Generate role-based nav
    if (navMenu) {
        let navHTML = `
        <a href="/pages/profile.html">Profile</a>
    `;

        if (userInfo.userLevel === 'admin') {
            navHTML = `
                <a href="/pages/dashboard.html">Dashboard</a>
                <a href="/pages/employees.html">Employees</a>
                <a href="/pages/detachments.html">Detachments</a>
            ` + navHTML;
        }

        navHTML += `<button id="logoutBtn">Logout</button>`;
        navMenu.innerHTML = navHTML;

        // Attach logout handler after nav built
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                localStorage.removeItem('userInfo');
                window.location.href = '/pages/login.html';
            });
        }
    }

    loadProfile();
});

async function loadProfile() {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (!userInfo) return;

    const profile = await getEmpProfile(userInfo.database, userInfo.empNo);

    if (!profile || !profile.basicInfo) {
        console.error('Failed to load profile data.');
        return;
    }

    const profENum = document.getElementById("bi_empNo");
    if (profENum) profENum.textContent = profile.basicInfo.ji_empNo || '';

    const profLName = document.getElementById("bi_lastName");
    if (profLName) profLName.textContent = profile.basicInfo.ji_lname || '';

    const profExtName = document.getElementById("bi_extName");
    if (profExtName) profExtName.textContent = profile.basicInfo.ji_extname || '';

    const profFName = document.getElementById("bi_firstName");
    if (profFName) profFName.textContent = profile.basicInfo.ji_fname || '';

    const profMName = document.getElementById("bi_middleName");
    if (profMName) profMName.textContent = profile.basicInfo.ji_mname || '';
}