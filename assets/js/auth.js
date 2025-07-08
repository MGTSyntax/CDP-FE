// auth.js

import { getDatabases, loginUser, getUserInfo } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
    const loginForm = document.querySelector("#loginForm");
    const dbSelect = document.querySelector("#database");

    // Populate databases into the select dropdown
    async function populateDatabases() {
        const databases = await getDatabases();
        if (dbSelect) {
            databases.forEach(db => {
                const option = new Option(db.label, db.value);
                dbSelect.appendChild(option);
            });
        }
    }
    // Call populateDatabases when the page loads
    await populateDatabases();

    // Handle login form submission
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const database = dbSelect.value;
        const username = document.querySelector("#username").value.trim();
        const password = document.querySelector("#password").value.trim();

        if (!database || !username || !password) {
            alert('All fields are required.');
            return;
        }

        try {
            // Call API to Login User
            const result = await loginUser(database, username, password);

            if (result.success) {
                const userInfo = await getUserInfo(database, result.empNo);
                if (userInfo) {
                    const fullUserInfo = {
                        database,
                        empNo: userInfo.empNo,
                        firstName: userInfo.firstName,
                        lastName: userInfo.lastName,
                        userLevel: result.userLevel
                    };

                    localStorage.setItem('userInfo', JSON.stringify(fullUserInfo));

                    alert('Login successful.');

                    const redirectMap = {
                        superadmin: '/pages/dashboard.html',
                        hr: '/pages/dashboard.html',
                        payroll: '/pages/dashboard.html',
                        adlogistics: '/pages/dashboard.html',
                        finance: '/pages/dashboard.html',
                        fieldpersonnel: '/pages/profile.html'
                    };

                    const redirectPage = redirectMap[result.userLevel] || '/pages/profile.html';
                    window.location.href = redirectPage;
                } else {
                    alert('Something went wrong loading user info.');
                }
            } else {
                alert('Invalid credentials. Please try again.');
            }
        } catch (error) {
            alert('Login failed: ' + error.message);
        }
    });
});