// /assets/js/auth.js
import { loginUser, getUserInfo } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
    const loginForm = document.querySelector("#loginForm");

    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const username = document.querySelector("#username").value.trim();
        const password = document.querySelector("#password").value.trim();

        if (!username || !password) {
            alert('All fields are required.');
            return;
        }

        try {
            const mainDb = "file_metadata";
            const result = await loginUser(mainDb, username, password);

            if (result.success) {
                const companyDb = result.company_id;
                const userInfo = await getUserInfo(companyDb, result.empNo);
                
                if (userInfo) {
                    const fullUserInfo = {
                        mainDatabase: mainDb,
                        database: companyDb,
                        empNo: userInfo.empNo,
                        firstName: userInfo.firstName,
                        lastName: userInfo.lastName,
                        userLevel: result.userLevel,
                        companyId: result.company_id,
                        username: result.username,
                        role: result.role,
                        permissions: result.permissions
                    };

                    localStorage.setItem('userInfo', JSON.stringify(fullUserInfo));
                    alert('Login successful.');
                    window.location.href = '/pages/dashboard.html';
                }

            } else {
                return alert(result.message);
            }
        } catch (error) {
            alert('Login failed: ' + error.message);
        }
    });
});