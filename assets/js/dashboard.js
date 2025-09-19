// /assets/js/dashboard.js

import { renderNav } from "./statics/navbar.js";
import { getEmpProfile } from "./api.js";

document.addEventListener('DOMContentLoaded', () => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    if (!userInfo) {
        console.error("No user data found in local storage.");
        window.location.href = '/pages/login.html'; // redirect if not logged in
        return;
    }

    // Render nav
    renderNav(userInfo);

    // Get top profile record
    loadProfile();
});

async function loadProfile() {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (!userInfo) return;

    const profile = await getEmpProfile(userInfo.database, userInfo.empNo);
    if (profile && profile.basicInfo) {
        const basicInfoENum = document.getElementById("bi_empNo");
        if (basicInfoENum) basicInfoENum.textContent = profile.basicInfo.ji_empNo || '';

        const biFullName = document.getElementById("bi_fullname");
        if (biFullName) {
            const lname = profile.basicInfo.ji_lname || '';
            const extname = profile.basicInfo.ji_extname ? `${profile.basicInfo.ji_extname}` : '';
            const fname = profile.basicInfo.ji_fname || '';
            const mname = profile.basicInfo.ji_mname ? ` ${profile.basicInfo.ji_mname}` : '';

            biFullName.textContent = `${lname}${extname}, ${fname}${mname}`;
        }

        const eaEmailAdd = document.getElementById("email_add");
        if (eaEmailAdd) eaEmailAdd.textContent = profile.emailaddInfo.email_add || '';

        const jiPosition = document.getElementById("ji_pos");
        if (jiPosition) jiPosition.textContent = profile.jobInfo.ji_pos || '';

    }

}