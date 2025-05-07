// auth.js - Handles login form logic
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
            console.log("Login result:", result);

            if (result.success) {
                console.log("Calling getUserInfo with:", database, result.empNo);
                const userInfo = await getUserInfo(database, result.empNo);
                if (userInfo) {
                    localStorage.setItem('userInfo', JSON.stringify({
                        database,
                        empNo: userInfo.empNo,
                        firstName: userInfo.firstName,
                        lastName: userInfo.lastName,
                        userLevel: result.userLevel
                    }));

                    alert('Login successful.');
                    if (result.userLevel === 'admin' || result.userLevel === 'supervisor') {
                        window.location.href = '/pages/dashboard.html';
                    } else {
                        window.location.href = '/pages/profile.html';
                    }
                } else {
                    alert('Oh no!');
                }
            } else {
                alert('Invalid credentials. Please try again.');
            }
        } catch (error) {
            alert('Login failed: ' + error.message);
        }
    });
});