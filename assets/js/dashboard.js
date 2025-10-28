// /assets/js/dashboard.js
import { getEmpProfile } from "./api.js";
import Chart from "https://cdn.jsdelivr.net/npm/chart.js";

document.addEventListener('DOMContentLoaded', () => {
    
    // Get top profile record
    loadProfile();

    const ctx = document.getElementById('activityChart');
    if (ctx) {
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr'],
                datasets: [{
                    label: 'Request',
                    data: [12, 19, 8, 15],
                    borderWidth: 1,
                    backgroundColor: 'rgba(0, 123, 255, 0.5)'
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }
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