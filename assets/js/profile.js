// profile.js - Loads user info and shows in the navbar
import { getEmployeeProfile } from "./api";

async function loadProfile() {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (!userInfo) return;

    const profile = await getEmployeeProfile(userInfo.database, userInfo.empNo);

    if (!profile || !profile.basicInfo) {
        console.error('Failed to load profile data.');
        return;
    }

    document.getElementById("empNo").textContent = profile.basicInfo?.ji_empNo || '';
    document.getElementById("lastName").textContent = profile.basicInfo?.ji_lname || '';
    document.getElementById("extName").textContent = profile.basicInfo?.ji_extname || '';
    document.getElementById("firstName").textContent = profile.basicInfo?.ji_fname || '';
    document.getElementById("middleName").textContent = profile.basicInfo?.ji_mname || '';
}

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
    welcomeMessage.textContent = `Hi ${userInfo.firstName}!`;

    // Generate role-based nav
    if (navMenu) {
        let navHTML = `
        <a href="/pages/profile.html">Profile</a>
        <a href="/pages/employees.html">Employees</a>
        <a href="/pages/detachments.html">Detachments</a>
    `;

    if (userInfo.userLevel === 'admin') {
        navHTML = `<a href="/pages/dashboard.html">Dashboard</a>` + navHTML;
    }

    navHTML += `<button id="logoutBtn">Logout</button>`;
    navMenu.innerHTML = navHTML;

    // Attach logout handler after nav built
    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn?.addEventListener('click', () => {
        localStorage.removeItem('userInfo');
        window.location.href = '/pages/login.html';
    });
    }

    loadProfile();
});